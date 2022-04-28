import classNames from "classnames";
import React from "react";
import { useLocation } from "react-router-dom";
import { useMedia } from "../lib/useMedia";
import { FolderTree } from "../state/useFileStore";
import { Breadcrumb } from "./Breadcrumb";
import { Paginator } from "./Paginator";
import { Refresh } from "./Refresh";

interface HeaderProps {
  currentFolder: FolderTree;
  currentPage?: number;
  pages?: number;
  className?: string;
}

export const Header = ({ currentFolder, currentPage, pages, className }: HeaderProps) => {
  const { pathname } = useLocation();
  const isMobile = useMedia('(max-width: 639px), (pointer: coarse)');
  const match = pathname.replace(/\/page\/\d+/, '').match(/^\/folder\/(.*)/);
  const showPaginator = typeof currentPage !== 'undefined' && typeof pages !== 'undefined';

  return (
    <header
      className={classNames(
        "mt-18",
        className
      )}
    >
      <div className="flex items-center py-2">
        <Breadcrumb currentFolder={currentFolder} />
        <Refresh className="hidden sm:block ml-auto" />
      </div>      
      <nav className={classNames(
          "border-t border-gray-200 mb-4 px-4 flex items-center justify-end sm:px-0",
          isMobile ? 'justify-center' : 'justify-end'
        )}
      >
        {showPaginator && (
          <Paginator 
            pages={pages} 
            currentPage={currentPage}
            pagesShownLimit={isMobile ? 2 : 3}
            linkBuilder={(page) => {
              if (!page) {
                return null;
              }
              
              return `${match?.[1] || ''}/page/${page || 1}`
            }}
          />
        )}
      </nav>
    </header>
  );
};
