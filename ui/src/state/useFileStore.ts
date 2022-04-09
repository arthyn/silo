import { ListObjectsV2Command, S3Client, _Object } from '@aws-sdk/client-s3';
import { DefaultExtensionType } from 'react-file-icon';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { StorageState } from './storage';

interface FileStore {
  client: S3Client | null;
  status: 'initial' | 'loading' | 'success' | 'error';
  files: File[];
  folders: FolderTree;
  currentFolder: FolderTree;
  currentFile: File | null;
  setCurrentFile: (key: string, folder: FolderTree) => File | undefined;
  getFiles: (s3: StorageState['s3']) => void;
  setFiles: (files: _Object[], s3: StorageState['s3']) => void;
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
  children: FolderTree[]
}

export function normalizeRoot(path: string) {
  return path[0] === '/' ? path.slice(1) : path;
}

export function splitPath(path: string) {
  const normPath = normalizeRoot(path);

  if (normPath === '') {
    return ['/'];
  }

  return ['/', ...normPath.split('/')];
}

export function getFileInfo(filepath: string): Omit<File, 'data' | 'ancestors' | 'url'> {
  const normFilepath = normalizeRoot(filepath)
  const index = normFilepath.lastIndexOf('/');
  const folder = index !== -1 ? '/' + normFilepath.slice(0, index) : '/';
  const filename = normFilepath.slice(index + 1);
  const { name, extension } = getFilenameParts(filename);
  const datePattern = /(\d{4}\.\d{1,2}\.\d{2}\.\.(\d{2}\.?){3})-/;
  const dateMatch = filename.match(datePattern);
  const date = dateMatch ? dateMatch[1] : '';
  const filenameMinusDate = filename.replace(datePattern, '');

  return {
    filename,
    filenameMinusDate,
    name,
    date,
    extension,
    folder,
  }
}

export function getFileUrl(key: string, s3: StorageState['s3']) {
  const endpoint = s3.credentials?.endpoint;
  if (!endpoint) {
    return '';
  }

  const normEndpoint = endpoint.slice(-1) === '/' ? endpoint : endpoint + '/';
  const url = new URL(normEndpoint + key);
  url.host = `${s3.configuration.currentBucket}.${url.host}`;

  return url.toString();
}

export function getFilenameParts(filename: string): { name: string, extension: DefaultExtensionType } {
  const extIndex = filename.lastIndexOf('.');
  const name = filename.slice(0, extIndex);
  const extension = filename.slice(extIndex + 1);

  return {
    name,
    extension: (extension || '') as DefaultExtensionType
  }
}

export function filesEqual(fileA: File, fileB: File): boolean {
  return fileA.folder === fileB.folder && fileA.filename === fileB.filename;
}

function parseFolderIntoTree(folders: string[], previous: string = ''): FolderTree | undefined {
  const folder = folders[0];

  if (typeof folder === 'undefined') {
    return; 
  }

  const path = folder === '/' 
    ? '/' 
    : previous !== '/' 
      ? `${previous}/${folder}` 
      : previous + folder;
  const tree = parseFolderIntoTree(folders.slice(1), path);

  return {
    name: folder,
    path,
    pathSegments: splitPath(path),
    children: tree ? [tree] : []
  }
}

// assume trees both start at same height aka "root"
function mergeTrees(treeA: FolderTree, treeB: FolderTree): FolderTree | undefined {
  if (treeA.name !== treeB.name) {
    return;
  }

  const children: FolderTree[] = [];
  for (const child of treeA.children) {
    const sameB = treeB.children.find(c => c.name === child.name);
    
    if (sameB) {
      const merged = mergeTrees(child, sameB); 
      if (merged) {
        children.push(merged);
      } else {
        throw new Error('something very wrong happened')
      }
    } else {
      children.push(child);
    }
  }

  treeB.children
    .filter(b => !children.find(c => c.name === b.name))
    .forEach(child => {
      children.push(child);
    })

  return {
    ...treeA,
    children
  }

}

export function traverseTree(partialPath: string, tree: FolderTree): FolderTree | undefined {
  const segments = partialPath[0] === '/' ? splitPath(partialPath) : partialPath.split('/');
  const first = segments[0];

  if (typeof first === 'undefined') {
    return;
  }

  if (tree.name === partialPath) {
    return tree;
  }

  for (const child of tree.children) {
    const nextPath = segments.slice(1).join('/');
    if (child.name === segments[1]) {
      return traverseTree(nextPath, child);
    }    
  }
}

const root = { name: '/', path: '/', pathSegments: ['/'], children: [] };

export const useFileStore = create<FileStore>(persist((set, get) => ({
  client: null,
  status: 'initial',
  files: [],
  folders: root,
  currentFolder: root,
  currentFile: null,
  setCurrentFile: (key: string, folder: FolderTree) => {
    const file = get().files
      .find(file => `${file.folder === '/' ? '' : file.folder}/${file.filename}` === key)

    if (file) {
      set({ currentFile: file, currentFolder: folder });
    }
      
    return file;
  },
  getFiles: async (s3: StorageState['s3']) => {
    const { client, setFiles } = get();
    if (!client || !s3.configuration.currentBucket) {
      return;
    }
    
    const resp = await client.send(new ListObjectsV2Command({
      Bucket: s3.configuration.currentBucket
    }));

    setFiles(resp.Contents || [], s3);
  },
  setFiles: (newFiles: _Object[], s3: StorageState['s3']) => {
    let tree = get().folders;
    const files = newFiles.map(file => {
      const key = file.Key || '';
      const {
        folder,
        filename,
        ...info
      } = getFileInfo(key);
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
        url: getFileUrl(file.Key || '', s3),
        ancestors: splitPath(folder),
        folder,
        filename,
        ...info,
      }
    }).filter(file => file !== null) as File[];

    // console.log('final tree', tree)
    set({
      files,
      folders: tree
    })
  }
}), {
  name: 'file-store',
  partialize: ({ currentFolder, client, currentFile, ...state }) => {
    return state;
  }
}))