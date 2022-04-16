import { CogIcon, MenuAlt1Icon } from "@heroicons/react/solid";
import * as Accordion from "@radix-ui/react-accordion";
import { ChargeUpdateInitial, scryCharges } from "@urbit/api";
import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import create from "zustand";
import { api } from "../state/api";
import {
  FolderTree as FolderTreeType,
  useFileStore,
} from "../state/useFileStore";
import { useDropZone } from "../upload/DropZone";
import { FolderTree } from "./FolderTree";
import { Refresh } from "./Refresh";

interface MobileNav {
  isOpen: boolean;
  toggle: (open: boolean) => void;
}

const useMobileNav = create<MobileNav>((set) => ({
  isOpen: false,
  toggle: (open: boolean) => set({ isOpen: open }),
}));

interface SidebarContentProps {
  folders: FolderTreeType;
  currentFolder: FolderTreeType;
}

const UploadButton = () => (
  <button
    className="button self-start"
    onClick={() => useDropZone.setState({ status: "open" })}
  >
    <svg
      className="-ml-1 mr-2 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
        clipRule="evenodd"
      />
    </svg>
    Upload
  </button>
);

export const SidebarLayout = () => {
  const { folders, currentFolder } = useFileStore();
  const [version, setVersion] = useState('');
  
  useEffect(() => {
    if (!version) {
      api.scry<ChargeUpdateInitial>(scryCharges).then(charges => {
        const version = charges.initial.silo?.version;

        if (version) {
          setVersion(version);
        }
      })
    }
  }, [])

  return (
    <div className="sm:grid gap-6 grid-cols-[minmax(max-content,320px),1fr] h-full">
      <aside>
        <div className="sticky top-8 hidden sm:flex flex-col min-h-[calc(100vh-4rem)] max-w-xl">
          <h1 className="text-3xl font-bold mb-1">silo</h1>
          <nav className="mb-6">
            <FolderTree
              type="nav"
              folder={folders}
              currentFolder={currentFolder}
              topLevelAccordion
            />
          </nav>
          <Link
            to="/settings"
            className="default-ring self-start inline-flex items-center mb-4 font-semibold text-gray-600 hover:underline rounded-md"
          >
            <CogIcon className="w-5 h-5 mr-2 text-indigo-300" />
            Settings
          </Link>
          <UploadButton />
          <footer className="mt-auto text-sm text-gray-400 space-x-4">
            {version && <span>v{version}</span>}
            <a
              className="font-mono default-ring underline rounded-md hover:text-indigo-500"
              href="web+urbitgraph://group/~nocsyx-lassul/silo"
            >
              ~nocsyx-lassul/silo
            </a>
          </footer>
        </div>
      </aside>
      <Outlet />
      <footer className="fixed z-40 bottom-0 left-0 sm:hidden w-full p-4 bg-white border-t-2 border-indigo-300">
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="mobile-nav">
            <Accordion.Content className="accordion-content pb-6">
              <h1 className="text-3xl font-bold mb-1">silo</h1>
              <nav className="mb-4">
                <FolderTree
                  type="nav"
                  folder={folders}
                  currentFolder={currentFolder}
                  topLevelAccordion
                />
              </nav>
              <Link
                to="/settings"
                className="default-ring self-start inline-flex items-center mb-10 font-semibold text-gray-600 rounded-md"
              >
                <CogIcon className="w-5 h-5 mr-2 text-indigo-300" />
                Settings
              </Link>
              <footer className="mt-4 text-sm text-gray-400 space-x-4">
                {version && <span>v{version}</span>}
                <a
                  className="font-mono default-ring underline rounded-md hover:text-indigo-500"
                  href="web+urbitgraph://group/~nocsyx-lassul/silo"
                >
                  ~nocsyx-lassul/silo
                </a>
              </footer>
            </Accordion.Content>
            <Accordion.Header className="flex items-center">
              <UploadButton />
              <div className="ml-auto space-x-4">
                <Refresh />
                <Accordion.Trigger className="p-1 ml-auto text-indigo-400 hover:text-indigo-600 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                  <MenuAlt1Icon className="w-7 h-7" />
                </Accordion.Trigger>
              </div>
            </Accordion.Header>
          </Accordion.Item>
        </Accordion.Root>
      </footer>
    </div>
  );
};
