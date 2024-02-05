import { DownloadIcon, LinkIcon, TrashIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import copy from 'copy-to-clipboard';
import React, { useCallback, useState } from "react";
import { useStorage } from "../state/storage";
import { File, getFileUrl, useFileStore } from "../state/useFileStore";

interface FileActionsProps {
  file: File;
  className?: string;
}

function forceDownload(blob: string, filename: string) {
  var a = document.createElement('a');
  a.download = filename;
  a.href = blob;
  // For Firefox https://stackoverflow.com/a/32226068
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Current blob size limit is around 500MB for browsers
function downloadResource(url: string, filename: string) {
  return fetch(url, {
      headers: new Headers({
        'Origin': location.origin
      }),
      mode: 'cors'
    })
    .then(response => response.blob())
    .then(blob => {
      let blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch(e => {
      window.open(url, '_blank');
    });
}

export const FileActions = ({ file, className }: FileActionsProps) => {
  const { s3 } = useStorage();
  const { deleteFile } = useFileStore();
  const url = getFileUrl(file.data.Key || '', s3);
  const [copied, setCopied] = useState<string | null>(null);

  const remove = useCallback(() => {
    return deleteFile(file, s3);
  }, [file, s3]);
  
  const download = useCallback(async () => {
    return downloadResource(url, file.filename);
  }, [url, file]);

  const copyUrl = useCallback(() => {
    copy(url);
    setCopied('copied!')

    const timeout = setTimeout(() => {
      setCopied(null)
    }, 750);

    return () => clearTimeout(timeout);
  }, [url])

  return (
    <ul className={classNames('flex items-center space-x-2 p-1 leading-none text-indigo-300', className)}>
      <li>
        {!copied && <button onClick={copyUrl} className="hover:text-indigo-500">
          <LinkIcon className="w-8 h-8 sm:w-6 sm:h-6" />          
        </button>
        }
        {copied}
      </li>
      <li>
        <button onClick={download} className="hover:text-indigo-500">
          <DownloadIcon className="w-8 h-8 sm:w-6 sm:h-6" />
        </button>
      </li>
      <li>
        <button onClick={remove} className="hover:text-indigo-500">
          <TrashIcon className="w-8 h-8 sm:w-6 sm:h-6" />
        </button>
      </li>
    </ul>
  )
}