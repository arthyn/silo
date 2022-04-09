import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { addBucket, setAccessKeyId, setCurrentBucket, setEndpoint, setSecretAccessKey } from '@urbit/api';
import { api } from '../state/api';
import useStorageState from '../state/storage';
import { useAsyncCall } from '../lib/useAsyncCall';

interface CredentialsSubmit {
  endpoint: string;
  accessId: string;
  accessSecret: string;
  bucket: string;
}

export const Settings = () => {
  const { s3 } = useStorageState();
  const { register, handleSubmit, formState: { errors } } = useForm<CredentialsSubmit>();

  const { call: addS3Credentials, status } = useAsyncCall(useCallback(async (data: CredentialsSubmit) => {
    api.poke(setEndpoint(data.endpoint))
    api.poke(setAccessKeyId(data.accessId))
    api.poke(setSecretAccessKey(data.accessSecret));
    api.poke(addBucket(data.bucket));
    api.poke(setCurrentBucket(data.bucket))
  }, []));

  return (
    <section className='flex flex-col items-center justify-center min-h-screen'>
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
                <input type="text" defaultValue={s3.configuration.currentBucket} {...register('bucket')} id="bucket" className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button type="submit" disabled={status === 'loading'} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save</button>
          </div>
        </div>
      </form>
    </section>
  )
}