import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { addBucket, setAccessKeyId, setCurrentBucket, setEndpoint, setSecretAccessKey } from '../state/storage/lib';
import { api } from '../state/api';
import { useStorage } from "../state/storage";
import { useAsyncCall } from '../lib/useAsyncCall';
import { Spinner } from '../components/Spinner';

interface CredentialsSubmit {
  endpoint: string;
  accessId: string;
  accessSecret: string;
  bucket: string;
  region: string;
}

export const Empty = () => {
  const { hasCredentials, s3, loaded } = useStorage();
  // const credentials = s3.credentials;
  // const { client } = useFileStore();
  // const [buckets, setBuckets] = useState<Bucket[]>();
  // const [lock, setLock] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CredentialsSubmit>();

  const { call: addS3Credentials, status } = useAsyncCall(useCallback(async (data: CredentialsSubmit) => {
    api.poke(setEndpoint(data.endpoint))
    api.poke(setAccessKeyId(data.accessId))
    api.poke(setSecretAccessKey(data.accessSecret));
    api.poke(addBucket(data.bucket));
    api.poke(setCurrentBucket(data.bucket))
    api.poke({
      app: 'storage',
      mark: 'storage-action',
      json: { 'set-region': data.region },
    });
  }, []));

  // const setBucket = async (data: CredentialsSubmit) => {
  //   api.poke(addBucket(data.bucket));
  //   api.poke(setCurrentBucket(data.bucket))
  // }

  // useEffect(() => {
  //   async function loadBuckets() {
  //     debugger;
  //     if (!client) {
  //       return;
  //     }

  //     const response = await client.send(new ListBucketsCommand({}));
  //     setBuckets(response.Buckets);
  //   }

  //   loadBuckets();
  // }, [client])

  if (loaded && hasCredentials && s3.configuration.currentBucket) {
    return <Navigate to={'/folder'} />
  }

  debugger;

  if (!loaded && (!hasCredentials || !s3.configuration.currentBucket)) {
    return (
      <section className='flex flex-col items-center justify-center min-h-screen'>
        <div className='flex items-center space-x-3'>
          <Spinner className='w-8 h-8 text-indigo-500' />
          <h1 className="text-3xl font-bold">silo</h1>
        </div>
      </section>
    );
  }

  return (
    <section className='flex flex-col items-center justify-center min-h-screen'>
      <div className='mb-12 text-center'>
        <h1 className="text-3xl font-bold">silo</h1>
        <p>An S3 storage manager</p>
      </div>
      <form onSubmit={handleSubmit(addS3Credentials)} className="py-8 px-10 space-y-8 divide-y divide-gray-200 bg-indigo-50 rounded-2xl">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h2 className="text-lg leading-6 font-medium text-gray-900">S3 Storage Setup</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Store credentials for your S3 object storage buckets on your Urbit ship, and upload media freely to various modules. <a className="underline hover:text-indigo-500" href="https://urbit.org/using/os/s3" target="_blank" rel="noreferrer">Learn More</a></p>
          </div>
          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Endpoint</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input type="url" defaultValue={s3.credentials?.endpoint || ''} {...register('endpoint')} id="endpoint" className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="access-id" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Access Key ID</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input type="text" defaultValue={s3.credentials?.accessKeyId || ''} {...register('accessId')} id="access-id" className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="access-secret" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Secret Access Key</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input type="password" defaultValue={s3.credentials?.secretAccessKey || ''} {...register('accessSecret')} id="access-secret" className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="bucket" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Bucket</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input type="text" {...register('bucket')} id="bucket" className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Region</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input type="text" {...register('region')} id="region" className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* {hasCredentials && buckets && (
          <div className='pt-5'>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
              <label htmlFor="bucket" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Choose a default bucket:</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <select className='max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md'>
                  {buckets.map(bucket => (
                    <option key={bucket.Name} value={bucket.Name}>{bucket.Name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )} */}

        <div className="pt-5">
          <div className="flex justify-end">
            <button type="submit" disabled={status === 'loading'} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save</button>
          </div>
        </div>
      </form>
    </section>
  )
}