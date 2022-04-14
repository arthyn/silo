import {
  FolderAddIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/solid";
import * as Accordion from "@radix-ui/react-accordion";
import classNames from "classnames";
import classnames from "classnames";
import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FolderTree as FolderTreeType,
  searchTree,
  useFileStore,
} from "../state/useFileStore";
import { FolderEdit } from "./FolderEdit";

interface FolderProps {
  folder: FolderTreeType;
  currentFolder: FolderTreeType;
  topLevelAccordion?: boolean;
  onClick?: () => void;
}

const FolderLink = ({
  open,
  folder,
  onClick,
}: {
  open: boolean;
  folder: FolderTreeType;
  onClick?: () => void;
}) => (
  <div className="flex items-center group">
    <Link
      className={classnames(
        "default-ring flex items-center truncate text-xl sm:text-base rounded-md",
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
        "icon-button ml-3 opacity-0 group-hover:opacity-100 focus:opacity-100 peer-focus:opacity-100"
        // open && "opacity-100"
      )}
      onClick={onClick}
    >
      <FolderAddIcon className="w-6 h-6 sm:w-5 sm:h-5" />
      <span className="sr-only">Make New Folder</span>
    </button>
  </div>
);

export const FolderTree = ({
  folder,
  currentFolder,
  topLevelAccordion = false,
  onClick,
}: FolderProps) => {
  const { addFolder, makeFolder, removeEditingFolder } = useFileStore();
  console.log(currentFolder);
  const open = folder.path === currentFolder.path;

  const hasEditing = useCallback((folder: FolderTreeType) => {
    return searchTree(folder, (c) => c.editing);
  }, []);

  const collapsible = folder.children.map((child) => (
    <FolderTree key={child.path} folder={child} currentFolder={currentFolder} />
  ));

  if (topLevelAccordion) {
    return (
      <>
        <FolderLink
          open={!!hasEditing(folder) || open}
          folder={folder}
          onClick={() => addFolder(folder)}
        />
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
          hasEditing(folder) || currentFolder.path.startsWith(folder.path)
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
          {!folder.editing && (
            <FolderLink
              open={!!hasEditing(folder) || open}
              folder={folder}
              onClick={() => addFolder(folder)}
            />
          )}
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
    <FolderLink open={open} folder={folder} onClick={() => addFolder(folder)} />
  );
};
