import _ from 'lodash';
import { api } from '../api';
import { reduce } from './reducer';
import { enableMapSet } from 'immer';
import { createState, createSubscription, reduceStateN } from '../base';
import { S3Credentials } from '@urbit/api';

enableMapSet();

export interface GcpToken {
  accessKey: string;
  expiresIn: number;
}

export interface StorageState {
  loaded: boolean;
  hasCredentials: boolean;
  gcp: {
    configured?: boolean;
    token?: GcpToken;
    isConfigured: () => Promise<boolean>;
    getToken: () => Promise<void>;
  };
  s3: {
    configuration: {
      buckets: Set<string>;
      currentBucket: string;
      region: string;
    };
    credentials: S3Credentials | null;
  };
}

let numLoads = 0;

// @ts-ignore investigate zustand types
const useStorageState = createState<StorageState>(
  'Storage',
  (set, get) => ({
    loaded: false,
    hasCredentials: false,
    gcp: {
      isConfigured: () => {
        return api.thread({
          inputMark: 'noun',
          outputMark: 'json',
          threadName: 'gcp-is-configured',
          body: {}
        });
      },
      getToken: async () => {
        const token = await api.thread<GcpToken>({
          inputMark: 'noun',
          outputMark: 'gcp-token',
          threadName: 'gcp-get-token',
          body: {}
        });
        get().set((state) => {
          state.gcp.token = token;
        });
      }
    },
    s3: {
      configuration: {
        buckets: new Set(),
        currentBucket: '',
        region: ''
      },
      credentials: null
    }
  }),
  ['loaded', 's3', 'gcp'],
  [
    (set, get) =>
      createSubscription('storage', '/all', (e) => {
        const d = _.get(e, 'storage-update', false);
        if (d) {
          reduceStateN(get(), d, reduce);
        }

        numLoads++;
        if (numLoads === 2) {
          set({ loaded: true });
        }
      })
  ]
);

export default useStorageState;
