export type StorageService = 'presigned-url' | 'credentials';

export interface StorageConfiguration {
  buckets: Set<string>;
  currentBucket: string;
  region: string;
  publicUrlBase: string;
  presignedUrl: string;
  service: StorageService;
}

export interface BaseStorageState {
  loaded?: boolean;
  hasCredentials?: boolean;
  s3: {
    configuration: StorageConfiguration;
    credentials: StorageCredentials | null;
  };
  [ref: string]: unknown;
}

export interface StorageCredentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface StorageUpdateCredentials {
  credentials: StorageCredentials;
}

export interface StorageUpdateConfiguration {
  configuration: {
    buckets: string[];
    currentBucket: string;
  };
}

export interface StorageUpdateCurrentBucket {
  setCurrentBucket: string;
}

export interface StorageUpdateAddBucket {
  addBucket: string;
}

export interface StorageUpdateRemoveBucket {
  removeBucket: string;
}

export interface StorageUpdateEndpoint {
  setEndpoint: string;
}

export interface StorageUpdateAccessKeyId {
  setAccessKeyId: string;
}

export interface StorageUpdateSecretAccessKey {
  setSecretAccessKey: string;
}

export interface StorageUpdateRegion {
  setRegion: string;
}

export interface StorageUpdatePublicUrlBase {
  setPublicUrlBase: string;
}

export interface StorageUpdateToggleService {
  toggleService: string;
}

export interface StorageUpdateSetPresignedUrl {
  setPresignedUrl: string;
}

export declare type StorageUpdate =
  | StorageUpdateCredentials
  | StorageUpdateConfiguration
  | StorageUpdateCurrentBucket
  | StorageUpdateAddBucket
  | StorageUpdateRemoveBucket
  | StorageUpdateEndpoint
  | StorageUpdateAccessKeyId
  | StorageUpdateSecretAccessKey
  | StorageUpdateRegion
  | StorageUpdatePublicUrlBase
  | StorageUpdateToggleService
  | StorageUpdateSetPresignedUrl;
