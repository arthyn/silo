import { FolderIcon, FolderOpenIcon } from '@heroicons/react/solid';
import * as Accordion from '@radix-ui/react-accordion';
import classnames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { FolderTree as FolderTreeType } from '../state/useFileStore';

interface FolderProps {
  folder: FolderTreeType;
  currentFolder: FolderTreeType;
  topLevelAccordion?: boolean;
}

const FolderLink = ({ folder, currentFolder }: Omit<FolderProps, 'topLevelAccordion'>) => (
  <Link className={classnames('flex items-center truncate', folder.path === currentFolder.path && 'font-bold')} to={`/folder${folder.path}`}>
    {folder.path !== currentFolder.path && <FolderIcon className="w-5 h-5 mr-2 text-indigo-400"/>}
    {folder.path === currentFolder.path && <FolderOpenIcon className="w-5 h-5 mr-2 text-indigo-400" />}
    {folder.name || '/'}
  </Link>
)

export const FolderTree = ({ folder, currentFolder, topLevelAccordion = false }: FolderProps) => {
  const collapsible = folder.children.map(child => (
    <FolderTree key={child.path} folder={child} currentFolder={currentFolder} />
  ));

  if (topLevelAccordion) {
    return (
      <>
        <FolderLink folder={folder} currentFolder={currentFolder} />
        <Accordion.Root type="single" value={currentFolder.path} className='ml-4'>
          {collapsible}
        </Accordion.Root>
      </>
    )
  }

  if (folder.children.length > 0) {
    return (
      <Accordion.Item value={currentFolder.path.startsWith(folder.path) ? currentFolder.path : folder.path}>
        <Accordion.Header>
          <FolderLink folder={folder} currentFolder={currentFolder} />
        </Accordion.Header>
        <Accordion.Content>
          <Accordion.Root type="single" value={currentFolder.path} className='ml-4'>
            {collapsible}
          </Accordion.Root>
        </Accordion.Content>
      </Accordion.Item>
    )
  }

  return (
    <FolderLink folder={folder} currentFolder={currentFolder} />
  )
}