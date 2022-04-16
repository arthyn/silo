import {
  FolderAddIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderRemoveIcon,
} from "@heroicons/react/solid";
import * as Accordion from "@radix-ui/react-accordion";
import classNames from "classnames";
import classnames from "classnames";
import React, { useCallback } from "react";
import { useDrop } from "react-dnd";
import { Link } from "react-router-dom";
import { dragTypes } from "../pages/Catalog";
import useStorageState from "../state/storage";
import {
  File,
  FolderTree as FolderTreeType,
  searchTree,
  useFileStore,
} from "../state/useFileStore";
import { FolderEdit } from "./FolderEdit";

interface FolderProps {
  folder: FolderTreeType;
  currentFolder: FolderTreeType;
  type: 'nav' | 'action';
  allOpen?: boolean;
  topLevelAccordion?: boolean;
  onClick?: (folder: FolderTreeType) => void;
}

const FolderLink = ({
  open,
  folder,
  add,
  onDrop
}: {
  open: boolean;
  folder: FolderTreeType;
  add: () => void;
  onDrop?: (file: File, folder: FolderTreeType) => void;
}) => {
  const [{ isOver }, drop] = useDrop<{ file: File }, void, { isOver: boolean }>({
    accept: dragTypes.file,
    drop: ({ file }) => {
      onDrop && onDrop(file, folder);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });
  
  return (
    <div ref={drop} className="flex items-center group">
      <Link
        className={classnames(
          "default-ring flex items-center truncate text-xl sm:text-base rounded-md",
          isOver && 'ring-2',
          open && "font-bold"
        )}
        to={`/folder${folder.path}`}
      >
        {!open && (
          <FolderIcon className="w-6 h-6 sm:w-5 sm:h-5 mr-2 text-indigo-400" />
        )}
        {open && (
          <FolderOpenIcon className="w-6 h-6 sm:w-5 sm:h-5 mr-2 text-indigo-400" />
        )}
        {folder.name || "/"}
      </Link>
      <button
        className={classNames(
          "icon-button ml-6 sm:ml-3 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 peer-focus:opacity-100"
          // open && "opacity-100"
        )}
        onClick={add}
      >
        <FolderAddIcon className="w-6 h-6 sm:w-5 sm:h-5" />
        <span className="sr-only">Make New Folder</span>
      </button>
    </div>
  );
}

const FolderButton = ({ folder, onClick }: { folder: FolderTreeType, onClick?: (folder: FolderTreeType) => void}) => {
  return (
    <div className="flex items-center group">
      <button
        className={classnames(
          "default-ring flex items-center truncate text-xl sm:text-base rounded-md",
        )}
        onClick={() => onClick && onClick(folder)}
      >
        <FolderOpenIcon className="w-6 h-6 sm:w-5 sm:h-5 mr-2 text-indigo-400" />
        {folder.name || ''}
      </button>
    </div>
  )
}

export const FolderTree = ({
  folder,
  currentFolder,
  type,
  allOpen = false,
  topLevelAccordion = false,
  onClick,
}: FolderProps) => {
  const { s3 } = useStorageState();
  const { addFolder, makeFolder, moveFile, removeEditingFolder } = useFileStore();
  const open = folder.path === currentFolder.path;

  const move = useCallback((file: File, folder: FolderTreeType) => {
    moveFile(file, folder, s3);
  }, []);

  const hasEditing = useCallback((folder: FolderTreeType) => {
    return searchTree(folder, (c) => c.editing);
  }, []);

  const collapsible = folder.children.map((child) => (
    <FolderTree 
      key={child.path} 
      folder={child} 
      currentFolder={currentFolder} 
      type={type}
      allOpen={allOpen}
      onClick={onClick}
    />
  ));

  const FolderLeaf = () => (
    <>
      {type === 'nav' && <FolderLink
        open={!!hasEditing(folder) || open}
        folder={folder}
        add={() => addFolder(folder)}
        onDrop={move}
      />}
      {type === 'action' && <FolderButton folder={folder} onClick={onClick} />}
    </>
  )

  if (topLevelAccordion) {
    return (
      <>
        <FolderLeaf />
        <Accordion.Root
          type="single"
          value={currentFolder.path}
          className="ml-4"
        >
          {collapsible}
        </Accordion.Root>
      </>
    );
  }

  if (folder.children.length > 0) {
    return (
      <Accordion.Item
        value={
          allOpen || hasEditing(folder) || currentFolder.path.startsWith(folder.path)
            ? currentFolder.path
            : folder.path
        }
      >
        <Accordion.Header>
          {folder.editing && (
            <FolderEdit
              makeFolder={makeFolder}
              removeEditingFolder={removeEditingFolder}
            />
          )}
          {!folder.editing && (<FolderLeaf />)}
        </Accordion.Header>
        <Accordion.Content>
          <Accordion.Root
            type="single"
            value={currentFolder.path}
            className="ml-4"
          >
            {collapsible}
          </Accordion.Root>
        </Accordion.Content>
      </Accordion.Item>
    );
  }

  if (folder.editing) {
    return (
      <FolderEdit
        makeFolder={makeFolder}
        removeEditingFolder={removeEditingFolder}
      />
    );
  }

  return (
    <FolderLeaf />
  );
};
