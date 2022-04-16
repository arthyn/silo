import React, { FunctionComponent, useEffect } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { Outlet } from "react-router-dom";
import { Status } from "../lib/useAsyncCall";
import { DropZone, FileUpload, useDropZone } from "../upload/DropZone";

export const Layout: FunctionComponent = ({ children }) => {
  const { files, status } = useDropZone();
  const [{ isOver }, drop] = useDrop(() => ({
    accept: NativeTypes.FILE,
    drop: (item: { files: File[] }) => {
      const newFiles = Array.from(item.files).map((file) => ({
        file,
        status: "initial" as Status,
        response: null,
      }));
      useDropZone.setState({
        status: "dropped",
        files: ([] as FileUpload[]).concat(files, newFiles),
      });
    },
    hover: (item, monitor) => {
      if (monitor.canDrop()) {
        useDropZone.setState({ status: "dropping" });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    if (!isOver && status !== "dropped" && status !== "open") {
      console.log("setting initial", isOver, status);
      useDropZone.setState({ status: "initial" });
    }
  }, [isOver, status]);

  return (
    <main ref={drop} className="relative p-4 sm:p-8 min-h-screen">
      <Outlet />
      <DropZone />
    </main>
  );
};
