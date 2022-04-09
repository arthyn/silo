import { useCallback, useState } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

export type Status = 'initial' | 'loading' | 'success' | 'error';

type StatusStore<T extends { status: Status }> = UseBoundStore<T, StoreApi<T>>;

export function useAsyncCall<ReturnValue, StoreType extends { status: Status }>(cb: (...args: any[]) => Promise<ReturnValue>, store?: StatusStore<StoreType>) {
  const [_status, _setStatus] = useState<Status>('initial');
  const [error, setError] = useState<Error | null>(null);
  const setStatus = store ? (status: Status) => store.setState({ status }) : _setStatus;
  const { status } = store ? store() : { status: _status };

  const call = useCallback(
    (...args: any[]) => {
      setStatus('loading');
      cb(...args)
        .then((result) => {
          setStatus('success');
          return result;
        })
        .catch((err) => {
          setError(err);
          setStatus('error');
        });
    },
    [cb]
  );

  return {
    call,
    status,
    setStatus,
    error
  };
}
