import React, { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { useDropZone } from "../upload/DropZone";

export const Layout: FunctionComponent = ({ children }) => {
  const {
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop
  } = useDropZone();
  return (
    <main 
      className="relative p-8"
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragOver={onDragLeave}
      onDragLeave={onDragOver}
    >
      <Outlet />
    </main>
  )
}