import { daToDate } from "@urbit/api";
import compareAsc from "date-fns/compareAsc";
import { useDrag, useDrop } from "react-dnd";
import React, { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { File } from "../components/File";
import { FileActions } from "../components/FileActions";
import { Folder } from "../components/Folder";
import { Spinner } from "../components/Spinner";
import { useS3Redirect } from "../lib/useS3Redirect";
import useStorageState, { StorageState } from "../state/storage";
import {
  File as FileType,
  FolderTree,
  traverseTree,
  useFileStore,
} from "../state/useFileStore";
import classNames from "classnames";

export const dragTypes = {
  file: "FILE",
};

const FolderLink = ({ folder, s3 }: { folder: FolderTree; s3: StorageState['s3'] }) => {
  const { moveFile } = useFileStore()
  const [{ isOver }, drop] = useDrop({
    accept: dragTypes.file,
    drop: ({ file }) => {
      moveFile(file, folder, s3);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  console.log('isover', isOver)

  return (
    <Link
      ref={drop}
      className={classNames("default-ring rounded-xl", isOver && 'ring-2')}
      to={`/folder${folder.path}`}
    >
      <Folder name={folder.name} />
    </Link>
  )
};

const FileLink = ({ file }: { file: FileType }) => {
  const [, drag] = useDrag({
    type: dragTypes.file,
    item: { file },
  });

  return (
    <div ref={drag} className="relative group">
      <Link className="focus:outline-none" to={`/file/${file.data.Key}`}>
        <File file={file} />
      </Link>
      <FileActions
        className="absolute bottom-2 right-2 hidden sm:flex h-auto bg-gray-800 rounded opacity-0 group-hover:opacity-100 peer-active:opacity-0"
        file={file}
      />
    </div>
  );
};

export function Catalog() {
  useS3Redirect();
  const { pathname } = useLocation();
  const { s3 } = useStorageState();
  const { files, folders, currentFolder, status } = useFileStore();
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => file.folder === currentFolder.path)
      .sort((a, b) => {
        const dateA = a.date
          ? daToDate("~" + a.date)
          : new Date(a.data.LastModified || "");
        const dateB = b.date
          ? daToDate("~" + b.date)
          : new Date(b.data.LastModified || "");

        return compareAsc(dateA, dateB);
      });
  }, [currentFolder, files]);

  useEffect(() => {
    const normPath = pathname.replace("/folder", "");
    let nextFolder = traverseTree(normPath ? normPath : "/", folders);

    if (nextFolder) {
      useFileStore.setState({ currentFolder: nextFolder, currentFile: null });
      return;
    }
  }, [pathname, folders]);

  if ((!s3 || status === "loading") && files.length === 0) {
    return (
      <div>
        <Spinner className="w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb className="mb-4" currentFolder={currentFolder} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] auto-rows-min gap-4 pb-24 sm:pb-0">
        {currentFolder.children.map((child, index) => (
          <FolderLink key={child.path + index} folder={child} s3={s3} />
        ))}
        {s3.credentials?.endpoint &&
          status === "success" &&
          filteredFiles.map((file, index) => (
            <FileLink key={(file.data.Key || "") + index} file={file} />
          ))}
      </div>
    </div>
  );
}
