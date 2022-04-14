import { FolderOpenIcon, RefreshIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { FolderTree } from "../state/useFileStore";
import { Refresh } from "./Refresh";

interface BreadcrumbProps {
  currentFolder: FolderTree;
  className?: string;
}

const BreadCrumbItem = ({
  segments,
  index,
  currentPath,
}: {
  segments: string[];
  index: number;
  currentPath: string;
}) => {
  const crumbPath = "/" + segments.slice(1, index + 1).join("/");
  const active = crumbPath === currentPath;

  return (
    <li>
      <Link
        to={`/folder${crumbPath}`}
        className="default-ring group rounded-md"
      >
        {index >= 2 && <span className="mr-1 text-gray-400">/</span>}
        <span
          className={classNames(
            "mr-1",
            active && "font-semibold text-gray-900",
            !active && "hover:text-indigo-600"
          )}
        >
          {segments[index]}
        </span>
      </Link>
    </li>
  );
};

export const Breadcrumb = ({ currentFolder, className }: BreadcrumbProps) => {
  const { path, pathSegments } = currentFolder;

  return (
    <header
      className={classNames(
        "flex items-center py-2 mt-18 border-b-2 border-gray-200",
        className
      )}
    >
      <div className="flex items-center">
        <FolderOpenIcon className="w-5 h-5 mr-2 text-indigo-400" />
        <nav className="text-gray-500" aria-label="breadcrumb">
          <ol className="flex items-center" role="list">
            {pathSegments.map((folder, index) => (
              <BreadCrumbItem
                key={folder + index}
                segments={pathSegments}
                index={index}
                currentPath={path}
              />
            ))}
          </ol>
        </nav>
      </div>
      <Refresh className="hidden sm:block ml-auto" />
    </header>
  );
};
