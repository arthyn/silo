import { daToDate } from "@urbit/api";
import { useDrag, useDrop } from "react-dnd";
import React, { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
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
import create from "zustand";
import { useMedia } from "../lib/useMedia";
import { Header } from "../components/Header";
import { Paginator } from "../components/Paginator";
import { compareDesc } from "date-fns";

export const dragTypes = {
  file: "FILE",
};

interface CatalogStore {
  pageSize: number;
}

const useCatalog = create<CatalogStore>((set, get) => ({
  pageSize: 100
}))

const FolderLink = ({ folder, s3 }: { folder: FolderTree; s3: StorageState['s3'] }) => {
  const { moveFile } = useFileStore()
  const [{ isOver }, drop] = useDrop<{ file: FileType }, void, { isOver: boolean } >({
    accept: dragTypes.file,
    drop: ({ file }) => {
      moveFile(file, folder, s3);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

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

const FileLink = ({ file, lazy = true }: { file: FileType; lazy?: boolean }) => {
  const [, drag] = useDrag({
    type: dragTypes.file,
    item: { file },
  });

  return (
    <div ref={drag} className="relative group">
      <Link className="focus:outline-none" to={`/file/${file.data.Key}`}>
        <File file={file} lazy={lazy}/>
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
  const match = pathname.replace(/\/page\/\d+/, '').match(/^\/folder\/(.*)/);
  const page = pathname.match(/\/page\/(\d+)/)?.[1];
  const { s3 } = useStorageState();
  const isMobile = useMedia('(max-width: 639px), (pointer: coarse)');
  const { files, folders, currentFolder, status } = useFileStore();
  const { pageSize } = useCatalog();
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

        return compareDesc(dateA, dateB);
      });
  }, [currentFolder, files]);
  const total = filteredFiles.length;
	const pages =
		total % pageSize === 0
			? total / pageSize
			: Math.floor(total / pageSize) + 1;
  const pageInt = parseInt(page || '1', 10) - 1;
  const start = pageInt * pageSize;
  const fileSlice = filteredFiles.slice(start, Math.min(start + pageSize, total));

  useEffect(() => {
    if (isMobile) {
      useCatalog.setState({ pageSize: 25 });
    }
  }, [isMobile]);

  useEffect(() => {
    const normPath = pathname.replace("/folder", "").replace(/\/page\/\d+$/, '');
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
      <Header className="mb-4" currentFolder={currentFolder} currentPage={pageInt} pages={pages} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] auto-rows-min gap-4 mb-10">
        {currentFolder.children.map((child, index) => (
          <FolderLink key={child.path + index} folder={child} s3={s3} />
        ))}
        {s3.credentials?.endpoint &&
          status === "success" &&
          fileSlice.map((file, index) => (
            <FileLink key={(file.data.Key || "") + index} file={file} lazy={isMobile ? index > 8 : index > 24}/>
          ))}
      </div>
      <footer className="pb-24 sm:pb-0">
        <nav className={classNames(
            "border-t border-gray-200 mt-6 px-4 flex items-center sm:px-0",
            isMobile ? 'justify-center' : 'justify-end'
          )}
        >
          <Paginator 
            pages={pages} 
            currentPage={pageInt}
            pagesShownLimit={isMobile ? 2 : 3}
            linkBuilder={(page) => {
              if (!page) {
                return null;
              }
              
              return `${match?.[1] || ''}/page/${page || 1}`
            }}
          />
        </nav>
      </footer>
    </div>
  );
}
