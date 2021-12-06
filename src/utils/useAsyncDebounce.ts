// https://github.com/tannerlinsley/react-table/blob/aa2835766a7a34f70cd6b579628e4f7e820970ab/src/publicUtils.js

import { useRef, useCallback } from "react";

const useGetLatest = <T>(obj: T, defaultObj: T): (() => T) => {
  const ref = useRef<T>(defaultObj);
  ref.current = obj;

  return useCallback(() => ref.current, []);
};

const useAsyncDebounce = (
  defaultFn: (...param: unknown[]) => unknown | Promise<unknown>,
  defaultWait = 0
): ((...param: unknown[]) => unknown) => {
  const debounceRef = useRef<Record<string, unknown>>({});

  const getDefaultFn = useGetLatest<
    (...param: unknown[]) => unknown | Promise<unknown>
  >(defaultFn, () => {});
  const getDefaultWait = useGetLatest(defaultWait, 0);

  return useCallback(
    async (...args) => {
      if (!debounceRef.current.promise) {
        debounceRef.current.promise = new Promise((resolve, reject) => {
          debounceRef.current.resolve = resolve;
          debounceRef.current.reject = reject;
        });
      }

      if (debounceRef.current.timeout) {
        clearTimeout(debounceRef.current.timeout as number);
      }

      debounceRef.current.timeout = setTimeout(async () => {
        delete debounceRef.current.timeout;
        try {
          (debounceRef.current.resolve as (resolveValue: unknown) => unknown)(
            await getDefaultFn()(...args)
          );
        } catch (err) {
          (debounceRef.current.reject as (rejectValue: unknown) => unknown)(
            err
          );
        } finally {
          delete debounceRef.current.promise;
        }
      }, getDefaultWait());

      return debounceRef.current.promise;
    },
    [getDefaultFn, getDefaultWait]
  );
};

export default useAsyncDebounce;
