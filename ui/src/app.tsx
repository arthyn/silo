import React, { useCallback, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Layout } from "./components/Layout";
import { SidebarLayout } from "./components/SidebarLayout";
import { useAsyncCall } from "./lib/useAsyncCall";
import { Catalog } from "./pages/Catalog";
import { Details } from "./pages/Details";
import { Empty } from "./pages/Empty";
import { Settings } from "./pages/Settings";
import { api } from "./state/api";
import useStorageState from "./state/storage";
import { useFileStore } from "./state/useFileStore";
import { useMedia } from "./lib/useMedia";
import { isDev } from "./lib/util";

export function App() {
  const { s3 } = useStorageState();
  const credentials = s3.credentials;
  const configuration = s3.configuration;
  const { client, createClient, getFiles } = useFileStore();
  const { call: loadFiles } = useAsyncCall(
    useCallback(async (s3) => {
      return getFiles(s3);
    }, []),
    useFileStore
  );
  const isMobile = useMedia("(pointer: coarse)");

  useEffect(() => {
    async function init() {
      useStorageState.getState().initialize(api);
    }

    init();
  }, []);

  useEffect(() => {
    const hasCredentials =
      credentials?.accessKeyId &&
      credentials?.endpoint &&
      credentials?.secretAccessKey && configuration;
    if (hasCredentials) {
      createClient(credentials, configuration.region);

      useStorageState.setState({ hasCredentials: true });
      isDev && console.log("client initialized");
    }
  }, [credentials, configuration]);

  useEffect(() => {
    loadFiles(s3);

    // const interval = setInterval(() => {
    //   loadFiles(s3);
    // }, 30 * 1000)

    // return () => {
    //   clearInterval(interval);
    // }
  }, [loadFiles, s3, client]);

  return (
    <DndProvider
      backend={isMobile ? TouchBackend : HTML5Backend}
      options={
        isMobile
          ? {
              delay: 50,
              scrollAngleRanges: [
                { start: 30, end: 150 },
                { start: 210, end: 330 },
              ],
            }
          : undefined
      }
    >
      <BrowserRouter basename="/apps/silo">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Empty />} />
            <Route element={<SidebarLayout />}>
              <Route path="folder">
                <Route index element={<Catalog />} />
                <Route path="*" element={<Catalog />} />
                <Route path="*/page/:page" element={<Catalog />} />
              </Route>
              <Route path="file/*" element={<Details />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </DndProvider>
  );
}
