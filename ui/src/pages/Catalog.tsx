import { daToDate } from '@urbit/api';
import compareAsc from 'date-fns/compareAsc';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { File } from '../components/File';
import { FileActions } from '../components/FileActions';
import { Folder } from '../components/Folder';
import { Spinner } from '../components/Spinner';
import { useAsyncCall } from '../lib/useAsyncCall';
import { useS3Redirect } from '../lib/useS3Redirect';
import useStorageState from '../state/storage';
import { traverseTree, useFileStore } from '../state/useFileStore';

export function Catalog() {
  useS3Redirect();
  const { pathname } = useLocation();
  const { s3 } = useStorageState();
  const { files, folders, currentFolder, status } = useFileStore();
  const filteredFiles = useMemo(() => {
    return files.filter(file => file.folder === currentFolder.path)
      .sort((a, b) => {
        const dateA = a.date ? daToDate('~' + a.date) : new Date(a.data.LastModified || '');
        const dateB = b.date ? daToDate('~' + b.date) : new Date(b.data.LastModified || '');

        return compareAsc(dateA, dateB)
      })
  }, [currentFolder, files]);

  useEffect(() => {
    const normPath = pathname.replace('/folder', '');
    let nextFolder = traverseTree(normPath, folders);
    
    if (nextFolder) {
      useFileStore.setState({ currentFolder: nextFolder, currentFile: null });
      return;
    }
  }, [pathname, folders])

  import.meta.env.DEV && console.log(s3, status, files.length);

  if ((!s3 || status === 'loading') && files.length === 0) {
    return (
      <div>
        <Spinner className='w-8 h-8 text-indigo-500' />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb className='mb-4' currentFolder={currentFolder} />
      <div className='grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] auto-rows-min gap-4'>
        {currentFolder.children.map((child, index) => (
          <Link key={child.path + index} to={`/folder${child.path}`}>
            <Folder name={child.name} />
          </Link>
        ))}
        {s3.credentials?.endpoint && status === 'success' && filteredFiles.map((file, index) => (
          <div key={(file.data.Key || '') + index} className='relative group'>
            <Link to={`/file/${file.data.Key}`}>
              <File file={file} />
            </Link>
            <FileActions className='absolute bottom-2 right-2 h-auto opacity-0 group-hover:opacity-100' file={file} />
          </div>
        ))}
      </div>
    </div>
  );
}

