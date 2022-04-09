import React from 'react';
import { File as FileType } from '../state/useFileStore'
import { FileIcon, defaultStyles } from 'react-file-icon';
import { isImage } from '../lib/file';

interface FileProps {
  file: FileType;
}

export const File = ({ file }: FileProps) => {
  return (
    <div className='aspect-w-1 aspect-h-1'>
      <div>
        {isImage(file.extension)
          ? <img
              className="w-full h-full object-cover rounded-lg"
              src={file.url} 
              loading="lazy" 
            />
          : <div className='grid grid-cols-1 grid-rows-[1fr,auto,1fr] items-center justify-center h-full px-4'>
              <span />
              <div className='flex justify-center'>
                  <span className='w-16'>
                    <FileIcon extension={file.extension} {...defaultStyles[file.extension]} />
                  </span>
              </div>
              <span className='relative h-full'>
                <span className='absolute top-0 block w-full text-center text-sm mt-2 break-all'>{file.filenameMinusDate}</span>
              </span>
            </div>
        }
      </div>
    </div>
  )
}