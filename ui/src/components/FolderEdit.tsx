import { FolderIcon, XIcon } from "@heroicons/react/solid";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useStorage } from "../state/storage";
import { FileStore } from "../state/useFileStore";

interface FolderEditForm {
  folder: string;
}

interface FolderEditProps {
  makeFolder: FileStore["makeFolder"];
  removeEditingFolder: FileStore["removeEditingFolder"];
}

export const FolderEdit = ({
  makeFolder,
  removeEditingFolder,
}: FolderEditProps) => {
  const { s3 } = useStorage();
  const { handleSubmit, register } = useForm<FolderEditForm>();

  const onSubmit = useCallback(
    (data: FolderEditForm) => {
      makeFolder(data.folder, s3.configuration.currentBucket);
    },
    [s3]
  );

  return (
    <div className="flex items-center">
      <FolderIcon className="w-6 h-6 sm:w-5 sm:h-5 mr-2 text-indigo-400" />
      <form className="relative" onSubmit={handleSubmit(onSubmit)}>
        <label className="sr-only">Name new folder</label>
        <input
          type="text"
          {...register("folder", { required: true })}
          className="default-ring p-1 text-xl sm:text-base leading-tight sm:leading-tight text-indigo-800 bg-indigo-200 border-0 rounded"
          autoFocus
        />
        <button className="button absolute top-1/2 right-1 p-1 text-xs leading-none text-indigo-800 -translate-y-1/2 bg-transparent hover:bg-transparent hover:border-indigo-500 transition-colors">
          save
        </button>
        <button
          type="button"
          className="absolute top-1/2 left-full button ml-1 p-1 text-gray-500 bg-transparent hover:bg-transparent hover:text-red-600 -translate-y-1/2"
          onClick={removeEditingFolder}
        >
          <XIcon className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
