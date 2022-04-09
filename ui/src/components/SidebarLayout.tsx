import { MenuAlt1Icon } from '@heroicons/react/solid';
import * as Accordion from '@radix-ui/react-accordion';
import React from 'react';
import { Outlet } from 'react-router-dom';
import create from 'zustand';
import { FolderTree as FolderTreeType, useFileStore } from '../state/useFileStore';
import { useDropZone } from '../upload/DropZone';
import { FolderTree } from './FolderTree';
import { Refresh } from './Refresh';

interface MobileNav {
  isOpen: boolean;
  toggle: (open: boolean) => void;
}

const useMobileNav = create<MobileNav>((set) => ({
  isOpen: false,
  toggle: (open: boolean) => set({ isOpen: open })
}));

interface SidebarContentProps {
  folders: FolderTreeType;
  currentFolder: FolderTreeType;
}

const UploadButton = () => (
  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer" onClick={() => useDropZone.setState({ status: 'dropping' })}>
    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
    Upload
  </button>
)

export const SidebarLayout = () => {
  const { folders, currentFolder } = useFileStore();
  const { isOpen, toggle } = useMobileNav();

  return (
    <div className='sm:grid gap-6 grid-cols-[minmax(max-content,320px),1fr] min-h-screen'>
      <aside>
        <div className="sticky top-8 hidden sm:block max-w-xl">
          <h1 className="text-3xl font-bold mb-1">silo</h1>
          <nav className='mb-4'>
            <FolderTree folder={folders} currentFolder={currentFolder} topLevelAccordion/>
          </nav>
          <UploadButton />
        </div>
      </aside>
      <Outlet />
      <footer className='fixed z-40 bottom-0 left-0 sm:hidden w-full p-4 bg-white border-t-2 border-indigo-300'>
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="mobile-nav">
            <Accordion.Content className='accordion-content pb-6'>
              <h1 className="text-3xl font-bold mb-1">silo</h1>
              <nav className='mb-10'>
                <FolderTree folder={folders} currentFolder={currentFolder} topLevelAccordion/>
              </nav>
            </Accordion.Content>
            <Accordion.Header className='flex items-center'>
              <UploadButton />
              <div className='ml-auto space-x-4'>
                <Refresh />
                <Accordion.Trigger className="p-1 ml-auto text-indigo-400 hover:text-indigo-600 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                  <MenuAlt1Icon className='w-7 h-7' />
                </Accordion.Trigger>
              </div>
            </Accordion.Header>
          </Accordion.Item>
        </Accordion.Root>
      </footer>
    </div>      
  )
}