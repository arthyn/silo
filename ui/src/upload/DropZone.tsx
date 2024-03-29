import { PutObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
import { dateToDa, deSig } from "@urbit/api";
import classNames from "classnames";
import React, {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { defaultStyles, FileIcon } from "react-file-icon";
import create from "zustand";
import { Spinner } from "../components/Spinner";
import { Status } from "../lib/useAsyncCall";
import { useStorage } from "../state/storage";
import { getFilenameParts, useFileStore } from "../state/useFileStore";

export type DropStatus = "initial" | "open" | "dropping" | "dropped";

export interface FileUpload {
  file: File;
  status: Status;
  response: PutObjectCommandOutput | null;
}

interface DropZoneStore {
  status: DropStatus;
  files: FileUpload[];
}

export const useDropZone = create<DropZoneStore>(() => ({
  status: "initial",
  files: [],
}));

export const DropZone = () => {
  const { s3 } = useStorage();
  const { client, currentFolder, getFiles } = useFileStore();
  const { status, files } = useDropZone();
  const dropZone = useRef<HTMLDivElement>(null);
  const folder =
    currentFolder.path === "/" ? "" : currentFolder.path.slice(1) + "/";

  const close = useCallback(() => {
    getFiles(s3);
    useDropZone.setState({ status: "initial", files: [] });
  }, [s3]);

  const escapeClose = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    },
    [close]
  );

  useEffect(() => {
    async function upload() {
      if (files.length === 0 || !client) {
        return;
      }

      const timestamp = deSig(dateToDa(new Date()));

      for (const fileUpload of files.filter((f) => f.status === "initial")) {
        fileUpload.status = "loading";
        useDropZone.setState({ files }); //trigger state change;
        client
          .send(
            new PutObjectCommand({
              Bucket: s3.configuration.currentBucket,
              Key: `${folder}${timestamp}-${fileUpload.file.name}`,
              Body: fileUpload.file,
              ACL: "public-read",
              ContentType: fileUpload.file.type,
            })
          )
          .then((res) => {
            fileUpload.response = res;
            fileUpload.status = "success";
            useDropZone.setState({ files });
          })
          .catch((error) => {
            fileUpload.status = "error";
            useDropZone.setState({ files });
          });
      }

      getFiles(s3);
    }

    upload();
  }, [files, client]);

  const onFiles = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }

      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        status: "initial" as Status,
        response: null,
      }));
      useDropZone.setState({
        status: "dropped",
        files: ([] as FileUpload[]).concat(files, newFiles),
      });
    },
    [files]
  );

  useEffect(() => {
    if (status !== "initial") {
      dropZone.current?.focus();
    }
  }, [status]);

  if (status === "initial") {
    return null;
  }

  return (
    <div
      ref={dropZone}
      tabIndex={0}
      onKeyDown={escapeClose}
      className="fixed top-0 left-0 flex items-center justify-center h-screen w-screen p-6"
    >
      <div className="fixed z-0 top-0 left-0 h-screen w-screen bg-white opacity-80" />
      <div className="relative z-10 h-full w-full border-2 border-dashed border-gray-400 rounded-2xl pointer-events-none" />
      <div className="fixed z-20 flex flex-col items-center w-full max-w-lg py-8 px-12 text-center bg-white rounded-xl shadow-md">
        {files.length === 0 && (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Upload a file
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Drag a file into the window or click the button to select a file
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Uploading to: <strong>{currentFolder.path}</strong>
            </p>
          </>
        )}
        {files.length > 0 && (
          <div
            className={classNames(
              "inline-grid gap-3 grid-cols-[repeat(auto-fill,minmax(80px,1fr))] auto-rows-min w-full p-6 border-2 rounded-lg",
              status === "dropping" ? "border-indigo-600" : "border-indigo-200"
            )}
          >
            {files.map(({ file, status }, index) => (
              <div
                key={file.name + index}
                className="flex flex-col items-center justify-center px-1.5"
              >
                <div className="relative px-3">
                  <FileIcon
                    extension={getFilenameParts(file.name).extension}
                    {...defaultStyles[getFilenameParts(file.name).extension]}
                  />
                  {status === "loading" && (
                    <span className="absolute -bottom-3 right-0 text-indigo-500">
                      <Spinner className="w-6 h-6" />
                    </span>
                  )}
                  {status === "success" && (
                    <span className="absolute -bottom-3 right-0 text-green-500">
                      <CheckCircleIcon className="w-6 h-6" />
                    </span>
                  )}
                  {status === "error" && (
                    <span className="absolute -bottom-3 right-0 text-red-600">
                      <ExclamationCircleIcon className="w-6 h-6" />
                    </span>
                  )}
                </div>
                <div className="flex text-xs mt-2 max-w-full">
                  <span className="flex-1 truncate">
                    {getFilenameParts(file.name).name}
                  </span>
                  <span className="flex-none">
                    .{getFilenameParts(file.name).extension}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="inline-block mt-6 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 rounded-md">
          <input
            type="file"
            id="upload-files"
            className="sr-only"
            onChange={onFiles}
            multiple
          />
          <label htmlFor="upload-files" className="button">
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
            Upload {files.length > 0 && "More"}
          </label>
        </div>
        <button
          className="inline-flex p-2 mt-3 text-sm cursor-pointer hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={close}
        >
          Close
        </button>
      </div>
    </div>
  );
};
