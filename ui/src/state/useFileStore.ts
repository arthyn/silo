import {
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  _Object,
} from "@aws-sdk/client-s3";
import { S3Credentials } from "@urbit/api";
import { DefaultExtensionType } from "react-file-icon";
import create from "zustand";
import { persist } from "zustand/middleware";
import { StorageState } from "./storage";

export interface FileStore {
  client: S3Client | null;
  status: "initial" | "loading" | "success" | "error";
  files: File[];
  folders: FolderTree;
  currentFolder: FolderTree;
  currentFile: File | null;
  createClient: (s3: S3Credentials) => void;
  setCurrentFile: (key: string, folder: FolderTree) => File | undefined;
  getFiles: (s3: StorageState["s3"]) => void;
  setFiles: (files: _Object[], s3: StorageState["s3"]) => void;
  addFolder: (folder: FolderTree) => void;
  removeEditingFolder: () => void;
  makeFolder: (
    key: string,
    bucket: string
  ) => Promise<PutObjectCommandOutput | undefined>;
}

export interface File {
  data: _Object;
  url: string;
  filename: string;
  filenameMinusDate: string;
  name: string;
  date: string;
  extension: DefaultExtensionType;
  folder: string;
  ancestors: string[];
}

export interface FolderTree {
  name: string;
  path: string;
  pathSegments: string[];
  children: FolderTree[];
  editing: boolean;
}

export function normalizeRoot(path: string) {
  return path[0] === "/" ? path.slice(1) : path;
}

export function splitPath(path: string) {
  const normPath = normalizeRoot(path);

  if (normPath === "") {
    return ["/"];
  }

  return ["/", ...normPath.split("/")];
}

export function getFileInfo(
  filepath: string
): Omit<File, "data" | "ancestors" | "url"> {
  const normFilepath = normalizeRoot(filepath);
  const index = normFilepath.lastIndexOf("/");
  const folder = index !== -1 ? "/" + normFilepath.slice(0, index) : "/";
  const filename = normFilepath.slice(index + 1);
  const { name, extension } = getFilenameParts(filename);
  const datePattern = /(\d{4}\.\d{1,2}\.\d{2}\.\.(\d{2}\.?){3})-/;
  const dateMatch = filename.match(datePattern);
  const date = dateMatch ? dateMatch[1] : "";
  const filenameMinusDate = filename.replace(datePattern, "");

  return {
    filename,
    filenameMinusDate,
    name,
    date,
    extension,
    folder,
  };
}

export function prefixEndpoint(endpoint: string) {
  return endpoint.match(/https?:\/\//) ? endpoint : `https://${endpoint}`;
}

export function getFileUrl(key: string, s3: StorageState["s3"]) {
  const endpoint = s3.credentials?.endpoint;
  if (!endpoint) {
    return "";
  }

  const normEndpoint = endpoint.slice(-1) === "/" ? endpoint : endpoint + "/";
  const withProtocol = prefixEndpoint(normEndpoint);

  return `${withProtocol}${s3.configuration.currentBucket}/${key}`;
}

export function getFilenameParts(filename: string): {
  name: string;
  extension: DefaultExtensionType;
} {
  const extIndex = filename.lastIndexOf(".");
  const name = filename.slice(0, extIndex);
  const extension = filename.slice(extIndex + 1);

  return {
    name,
    extension: (extension || "") as DefaultExtensionType,
  };
}

export function filesEqual(fileA: File, fileB: File): boolean {
  return fileA.folder === fileB.folder && fileA.filename === fileB.filename;
}

function parseFolderIntoTree(
  folders: string[],
  previous: string = ""
): FolderTree | undefined {
  const folder = folders[0];

  if (typeof folder === "undefined") {
    return;
  }

  const path =
    folder === "/"
      ? "/"
      : previous !== "/"
      ? `${previous}/${folder}`
      : previous + folder;
  const tree = parseFolderIntoTree(folders.slice(1), path);
  return {
    name: folder,
    path,
    pathSegments: splitPath(path),
    children: tree ? [tree] : [],
    editing: false,
  };
}

// assume trees both start at same height aka "root"
function mergeTrees(
  treeA: FolderTree,
  treeB: FolderTree
): FolderTree | undefined {
  if (treeA.name !== treeB.name) {
    return;
  }

  const children: FolderTree[] = [];
  for (const child of treeA.children) {
    const sameB = treeB.children.find((c) => c.name === child.name);

    if (sameB) {
      const merged = mergeTrees(child, sameB);
      if (merged) {
        children.push(merged);
      } else {
        throw new Error("something very wrong happened");
      }
    } else {
      children.push(child);
    }
  }

  treeB.children
    .filter((b) => !children.find((c) => c.name === b.name))
    .forEach((child) => {
      children.push(child);
    });

  return {
    ...treeA,
    children,
  };
}

export function searchTree(
  tree: FolderTree,
  stop: (tree: FolderTree) => boolean
): FolderTree | undefined {
  if (stop(tree)) {
    return tree;
  }

  for (const child of tree.children) {
    const search = searchTree(child, stop);

    if (search) {
      return search;
    }
  }
}

export function traverseTree(
  partialPath: string,
  tree: FolderTree,
  stop?: (tree: FolderTree) => boolean
): FolderTree | undefined {
  const segments =
    partialPath[0] === "/" ? splitPath(partialPath) : partialPath.split("/");
  const first = segments[0];

  if (typeof first === "undefined") {
    return;
  }

  if ((stop && stop(tree)) || tree.name === partialPath) {
    return tree;
  }

  for (const child of tree.children) {
    const nextPath = segments.slice(1).join("/");
    if (child.name === segments[1]) {
      return traverseTree(nextPath, child);
    }
  }
}

const root = {
  name: "/",
  path: "/",
  pathSegments: ["/"],
  children: [],
  editing: false,
};

export const useFileStore = create<FileStore>(
  persist(
    (set, get) => ({
      client: null,
      status: "initial",
      files: [],
      folders: root,
      currentFolder: root,
      currentFile: null,
      createClient: (credentials: S3Credentials) => {
        const endpoint = new URL(prefixEndpoint(credentials.endpoint));
        const client = new S3Client({
          endpoint: {
            protocol: endpoint.protocol.slice(0, -1),
            hostname: endpoint.host,
            path: endpoint.pathname || "/",
          },
          region: "us-east-1",
          credentials,
          forcePathStyle: true, // needed with minio?
        });

        // client.middlewareStack.add(awsAuthMiddleware(resolveSigV4AuthConfig({
        //   credentials: {
        //     accessKeyId: credentials.accessKeyId,
        //     secretAccessKey: credentials.secretAccessKey
        //   },
        //   region: 'us-east-1',

        // })), {
        //   step: 'finalizeRequest',
        //   priority: 'high'
        // })
        set({ client });
      },
      setCurrentFile: (key: string, folder: FolderTree) => {
        const file = get().files.find(
          (file) =>
            `${file.folder === "/" ? "" : file.folder}/${file.filename}` === key
        );

        if (file) {
          set({ currentFile: file, currentFolder: folder });
        }

        return file;
      },
      getFiles: async (s3: StorageState["s3"]) => {
        const { client, setFiles } = get();
        if (!client || !s3.configuration.currentBucket) {
          return;
        }

        const listObjects = new ListObjectsV2Command({
          Bucket: s3.configuration.currentBucket,
        });

        const resp = await client.send(listObjects);

        setFiles(resp.Contents || [], s3);
      },
      setFiles: (newFiles: _Object[], s3: StorageState["s3"]) => {
        let tree = get().folders;
        const files = newFiles
          .map((file) => {
            const key = file.Key || "";
            const { folder, filename, ...info } = getFileInfo(key);
            const newTree = parseFolderIntoTree(splitPath(folder));

            // console.log('new tree', JSON.stringify(newTree));

            if (newTree) {
              const mergedTrees = mergeTrees(tree, newTree);
              if (mergedTrees) {
                tree = mergedTrees;
                // console.log('merged trees', JSON.stringify(mergedTrees, null, 2));
              }
            }

            if (!filename) {
              return null;
            }

            return {
              data: file,
              url: getFileUrl(file.Key || "", s3),
              ancestors: splitPath(folder),
              folder,
              filename,
              ...info,
            };
          })
          .filter((file) => file !== null) as File[];

        // console.log('final tree', tree)
        set({
          files,
          folders: tree,
        });
      },
      addFolder: (folder: FolderTree) => {
        if (folder.children.find((c) => c.editing)) {
          return;
        }

        folder.children.push({
          name: "",
          path: folder.path,
          pathSegments: folder.pathSegments,
          children: [],
          editing: true,
        });

        set({ folders: { ...get().folders } });
      },
      removeEditingFolder: () => {
        const { folders } = get();
        debugger;
        const editingFolder = searchTree(folders, (tree) => tree.editing);
        if (!editingFolder) {
          return;
        }

        const parent = traverseTree(editingFolder.path, folders);
        if (!parent) {
          return;
        }

        const index = parent.children.findIndex((c) => c.editing);
        if (index >= 0) {
          parent.children.splice(index, 1);
          set({ folders: { ...folders } });
        }
      },
      makeFolder: async (key: string, bucket: string) => {
        const { client, currentFolder } = get();
        if (!client) {
          return;
        }

        const current = currentFolder.path === "/" ? "" : currentFolder.path;
        const folderPath = `${current}/${key}`;
        const editingFolder = currentFolder.children.find((c) => c.editing);

        if (editingFolder) {
          editingFolder.name = key;
          editingFolder.path = folderPath;
          editingFolder.pathSegments = splitPath(folderPath);
          editingFolder.editing = false;
        }

        set({ currentFolder: { ...currentFolder } });

        return client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: folderPath + "/",
            ACL: "public-read",
          })
        );
      },
    }),
    {
      name: `${window.ship}/${window.desk}/file-store'`,
      partialize: ({ currentFolder, client, currentFile, ...state }) => {
        return state;
      },
    }
  )
);
