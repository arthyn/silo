import { FolderIcon } from '@heroicons/react/solid';
import React from 'react';

interface FolderProps {
  name: string;
}

export const Folder = ({ name }: FolderProps) => {
  return (
    <div className='group aspect-w-1 aspect-h-1'>
      <div className='grid grid-cols-1 grid-rows-[1fr,auto,1fr] items-center justify-center w-full h-full px-4'>
        <span />
        <div className='relative flex justify-center w-full'>
            <FolderIcon className='absolute z-10 w-24 h-24 group-hover:translate-x-2 group-hover:-skew-x-6 text-indigo-400 transition-transform duration-300' />
            <FolderIcon className='absolute z-20 w-24 h-24 group-hover:translate-x-1 group-hover:-skew-x-3 text-gray-100 transition-transform duration-300' />
            <FolderIcon className='relative z-30 w-24 h-24 text-indigo-400' />
        </div>
        <span className='relative h-full'>
          <span className='absolute top-0 block w-full -mt-2 font-semibold leading-none text-center text-base text-gray-700 break-all'>{name}</span>
        </span>
      </div>
    </div>
  )
}