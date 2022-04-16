import { ArrowLeftIcon, ReplyIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import { defaultStyles, FileIcon } from 'react-file-icon';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import { Breadcrumb } from '../components/Breadcrumb';
import { FileActions } from '../components/FileActions';
import { isImage, isVideo } from '../lib/file';
import { useS3Redirect } from '../lib/useS3Redirect';
import { getFileInfo, traverseTree, useFileStore } from '../state/useFileStore';
import { FolderTree } from '../components/FolderTree';
import useStorageState from '../state/storage';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const Details = () => {
  useS3Redirect();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { s3 } = useStorageState();
  const { 
    currentFile, 
    currentFolder, 
    folders, 
    setCurrentFile,
    moveFile
  } = useFileStore();
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);

  useEffect(() => {
    const normPath = decodeURIComponent(pathname.replace('/file', ''))
    const { folder, filename } = getFileInfo(normPath);
    const nextFolder = traverseTree(folder, folders);

    if (nextFolder && filename !== '' && !currentFile) {
      const file = setCurrentFile(normPath, nextFolder);
      if (file) {
        return;
      } else {
        navigate(`/folder${folder}`)    
      }
    }

    if (currentFile) {
      return;
    }

    navigate(`/folder${folder}`)
  }, [pathname, folders, currentFile]);


  if (!currentFile) {
    return null;
  }

  const showImage = isImage(currentFile.extension);
  const showVideo = isVideo(currentFile.extension);
  const showIcon = !showImage && !showVideo;
  
  return (
    <section className='space-y-6'>
      <Breadcrumb currentFolder={currentFolder} />
      <div className='grid grid-rows-[minmax(0,1fr),auto] h-[calc(100vh-13.5rem)] sm:h-[calc(100vh-8.25rem)] rounded-2xl'>
        <div className='relative group flex flex-col items-center justify-center p-6 pb-12 bg-indigo-100 rounded-2xl rounded-b-none'>
          {showImage && <img className='max-h-full max-w-full object-contain' src={currentFile.url} />}
          {showVideo && <video src={currentFile.url} controls />}
          {showIcon && <span className='w-40'><FileIcon extension={currentFile.extension} {...defaultStyles[currentFile.extension]} /></span>}
          <h1 className='absolute bottom-2 max-w-full mt-4 text-lg lg:text-xl leading-none font-semibold break-all'>{currentFile.filenameMinusDate}</h1>
        </div>
        <footer className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 w-full h-full p-6 bg-gray-100 rounded-2xl rounded-t-none'>
          <div>
            <h2 className='gray-500'>folder</h2>
            <p><strong>{currentFile.folder}</strong></p>
          </div>
          <div>
            <h2 className='gray-500'>size</h2>
            <p><strong>{formatBytes(currentFile.data.Size || 0)}</strong></p>
          </div>
          <div>
            <h2 className='gray-500'>last modified</h2>
            <p><strong>{currentFile.data.LastModified && new Date(currentFile.data.LastModified).toLocaleString()}</strong></p>
          </div>
          <div className="col-span-full flex items-center mt-4 pt-4 border-t-2 border-gray-200">
            <Popover.Root>
              <Popover.Trigger className='mr-2 text-indigo-300 hover:text-indigo-500'>
                <ReplyIcon className='w-8 h-8 sm:w-6 sm:h-6' />
              </Popover.Trigger>
              <Popover.Content className='p-6 rounded-xl bg-white border border-indigo-200'>
                <FolderTree 
                  type="action" 
                  folder={folders} 
                  currentFolder={currentFolder} 
                  topLevelAccordion 
                  allOpen 
                  onClick={(folder) => {
                    moveFile(currentFile, folder, s3)
                    navigate(`/folder/${folder.path}`)
                  }}
                />
                <Popover.Arrow className='fill-current text-indigo-200'/>
              </Popover.Content>
            </Popover.Root>
            <FileActions file={currentFile} />
          </div>
        </footer>
      </div>
      <Link to="-1" className='inline-flex items-center font-semibold text-gray-600'>
        <ArrowLeftIcon className='w-4 h-4 mr-1 text-gray-400' />
        Back
      </Link>
    </section>
  )
}