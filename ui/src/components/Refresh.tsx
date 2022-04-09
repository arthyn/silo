import { RefreshIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import React from 'react';
import useStorageState from '../state/storage';
import { useFileStore } from '../state/useFileStore';

export const Refresh = ({ className }: { className?: string }) => {
  const { s3 } = useStorageState();
  const { getFiles } = useFileStore();
  
  return (
    <button onClick={() => getFiles(s3)} className={classNames("p-1 text-indigo-400 hover:text-indigo-600 active:rotate-180 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer", className)}>
      <RefreshIcon className="w-7 h-7 sm:w-6 sm:h-6" />
      <span className="sr-only">Refresh files</span>
    </button>
  )
}