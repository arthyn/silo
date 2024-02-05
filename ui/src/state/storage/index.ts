import _ from 'lodash';
import { enableMapSet } from 'immer';
import { BaseStorageState, StorageUpdate } from './types';
import reduce from './reducer';
import {
  createState,
  createSubscription,
  reduceStateN,
  BaseState,
} from '../base';

enableMapSet();

let numLoads = 0;

export type StorageState = BaseStorageState & BaseState<BaseStorageState>;

export const useStorage = createState<BaseStorageState>(
  'Storage',
  () => ({
    loaded: false,
    hasCredentials: false,
    s3: {
      configuration: {
        buckets: new Set(),
        currentBucket: '',
        region: '',
        publicUrlBase: '',
        presignedUrl: '',
        service: 'credentials',
      },
      credentials: null,
    },
  }),
  ['loaded', 'hasCredentials', 's3'],
  [
    (set, get) =>
      createSubscription(
        'storage',
        '/all',
        (e: { 'storage-update': StorageUpdate }) => {
          const data = _.get(e, 'storage-update', false);
          if (data) {
            reduceStateN(get(), data, reduce);
          }
          numLoads += 1;
          if (numLoads === 2) {
            set({ loaded: true });
          }
        }
      ),
  ]
);
