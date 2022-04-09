import { S3Update } from '@urbit/api';
import _ from 'lodash';
import { BaseState } from '../base';
import { StorageState as State } from './index';

type StorageState = State & BaseState<State>;

const credentials = (json: S3Update, state: StorageState): StorageState => {
  const data = _.get(json, 'credentials', false);
  if (data) {
    state.s3.credentials = data;
  }
  return state;
};

const configuration = (json: S3Update, state: StorageState): StorageState => {
  const data = _.get(json, 'configuration', false);
  if (data) {
    state.s3.configuration = {
      buckets: new Set(data.buckets),
      currentBucket: data.currentBucket
    };
  }
  return state;
};

const currentBucket = (json: S3Update, state: StorageState): StorageState => {
  const data = _.get(json, 'setCurrentBucket', false);
  if (data && state.s3) {
    state.s3.configuration.currentBucket = data;
  }
  return state;
};

const addBucket = (json: S3Update, state: StorageState): StorageState => {
  const data = _.get(json, 'addBucket', false);
  if (data) {
    state.s3.configuration.buckets =
      state.s3.configuration.buckets.add(data);
  }
  return state;
};

const removeBucket = (json: S3Update, state: StorageState): StorageState => {
  const data = _.get(json, 'removeBucket', false);
  if (data) {
    state.s3.configuration.buckets.delete(data);
  }
  return state;
};

const endpoint = (json: S3Update, state: StorageState): StorageState => {
  const data = _.get(json, 'setEndpoint', false);
  if (data && state.s3.credentials) {
    state.s3.credentials.endpoint = data;
  }
  return state;
};

const accessKeyId = (json: S3Update , state: StorageState): StorageState => {
  const data = _.get(json, 'setAccessKeyId', false);
  if (data && state.s3.credentials) {
    state.s3.credentials.accessKeyId = data;
  }
  return state;
};

const secretAccessKey = (json: S3Update, state: StorageState): StorageState => {
  const data = _.get(json, 'setSecretAccessKey', false);
  if (data && state.s3.credentials) {
    state.s3.credentials.secretAccessKey = data;
  }
  return state;
};

export const reduce = [
  credentials,
  configuration,
  currentBucket,
  addBucket,
  removeBucket,
  endpoint,
  accessKeyId,
  secretAccessKey
];
