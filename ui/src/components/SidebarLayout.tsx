import React from 'react';
import { Outlet } from 'react-router-dom';
import { useFileStore } from '../state/useFileStore';
import { useDropZone } from '../upload/DropZone';
import { FolderTree } from './FolderTree';

export const SidebarLayout = () => {
  const { folders, currentFolder } = useFileStore();
  return (
    <div className='grid gap-6 grid-cols-[minmax(max-content,320px),1fr] min-h-screen'>
      <aside>
        <div className="sticky top-8 max-w-xl">
          <h1 className="text-3xl font-bold mb-1">silo</h1>
          <nav>
            <FolderTree folder={folders} currentFolder={currentFolder} topLevelAccordion/>
          </nav>
          <button className="inline-flex items-center px-4 py-2 mt-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer" onClick={() => useDropZone.setState({ status: 'dropping' })}>
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Upload
          </button>
        </div>
      </aside>
      <Outlet />
    </div>      
  )
}