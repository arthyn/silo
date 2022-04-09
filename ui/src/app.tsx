import { S3Client } from '@aws-sdk/client-s3';
import React, { useCallback, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SidebarLayout } from './components/SidebarLayout';
import { useAsyncCall } from './lib/useAsyncCall';
import { Catalog } from './pages/Catalog';
import { Details } from './pages/Details';
import { Empty } from './pages/Empty';
import { api } from './state/api';
import useStorageState from './state/storage';
import { prefixEndpoint, useFileStore } from './state/useFileStore';
import { DropZone } from './upload/DropZone';

export function App() {
  const {
    s3
  } = useStorageState();
  const credentials = s3.credentials;
  const { client, getFiles } = useFileStore();
  const { call: loadFiles } = useAsyncCall(useCallback(async (s3) => {
    return getFiles(s3)
  }, []), useFileStore);

  useEffect(() => {
    async function init() {
      useStorageState.getState().initialize(api);
    }

    init();
  }, []);

  useEffect(() => {
    const hasCredentials = credentials?.accessKeyId && credentials?.endpoint && credentials?.secretAccessKey;
    if (hasCredentials) {
      useFileStore.setState({ client: new S3Client({ 
          endpoint: prefixEndpoint(credentials.endpoint),
          region: 'us-east-1',
          credentials
        }) 
      });

      useStorageState.setState({ hasCredentials: true });
      console.log('client initialized')
    }
  }, [credentials])

  useEffect(() => {
      loadFiles(s3);

      // const interval = setInterval(() => {
      //   loadFiles(s3);
      // }, 30 * 1000)

      // return () => {
      //   clearInterval(interval);
      // }
  }, [loadFiles, s3, client])

  return (
    <BrowserRouter basename='/apps/silo'>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Empty />} />
          <Route element={<SidebarLayout />}>
            <Route path="folder" element={<Catalog />} />
            <Route path="folder/*" element={<Catalog />} />
            <Route path="file/*" element={<Details />} />
          </Route>
        </Route>
      </Routes>
      <DropZone />
    </BrowserRouter>
  );
}
