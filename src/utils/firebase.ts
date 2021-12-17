import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
} from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getDatabase,
  connectDatabaseEmulator,
  DatabaseReference,
  ref,
  onValue,
  get,
  ListenOptions,
  update,
  set,
  remove,
  serverTimestamp,
  Query,
} from "firebase/database";
import { useForceRerender } from "utils/miscHooks";

const firebaseConfig = {
  apiKey: "AIzaSyCh9I9xgFFoXhdfRz9XF-Bq-OceWPe3xD0",
  authDomain: "outstanding-ion-332805.firebaseapp.com",
  databaseURL:
    "https://outstanding-ion-332805-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "outstanding-ion-332805",
  storageBucket: "outstanding-ion-332805.appspot.com",
  messagingSenderId: "344004181789",
  appId: "1:344004181789:web:30930b8c89f73bdbe6ebf4",
  measurementId: "G-K9P59EBQNR",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = (() => {
  const authLocal = getAuth(app);
  if (location.hostname === "localhost") {
    connectAuthEmulator(authLocal, "http://localhost:9099");
  }
  return authLocal;
})();
export const database = (() => {
  const db = getDatabase(app);
  if (location.hostname === "localhost") {
    // Point to the RTDB emulator running on localhost.
    connectDatabaseEmulator(db, "localhost", 9000);
  }
  return db;
})();

export const useGetServer = <T = unknown>(
  pathOrQuery: string | Query
): { loading: boolean; data: T | undefined; error: Error | undefined } => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const reference = useMemo(
    () =>
      typeof pathOrQuery === "string"
        ? ref(database, pathOrQuery)
        : pathOrQuery,
    [pathOrQuery]
  );
  useEffect(() => {
    setLoading(true);
    get(reference)
      .then((snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [reference]);
  return { loading, data, error };
};

export const useGetAndListen = <T = unknown>(
  pathOrQuery: string | Query,
  options?: ListenOptions
): { loading: boolean; data: T | undefined; error: Error | undefined } => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const reference = useMemo(
    () =>
      typeof pathOrQuery === "string"
        ? ref(database, pathOrQuery)
        : pathOrQuery,
    [pathOrQuery]
  );
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onValue(
      reference,
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      options ?? {}
    );
    return unsubscribe;
  }, [reference, options]);
  return { loading, data, error };
};

export const useGetCache = <T = unknown>(
  pathOrQuery: string | Query,
  options?: ListenOptions
): { loading: boolean; data: T | undefined; error: Error | undefined } => {
  const getCacheOption = useMemo(
    () => ({ ...options, onlyOnce: true }),
    [options]
  );
  return useGetAndListen(pathOrQuery, getCacheOption);
};

export const useLazyGetServer = <T = unknown>(): {
  loading: boolean;
  getServer: (pathOrQuery: string | Query) => Promise<T>;
} => {
  const [loading, dispatchLoading] = useReducer(
    (state: number, change: number) => state + change,
    0
  );
  const getServer = useCallback(async (pathOrQuery: string | Query) => {
    const reference =
      typeof pathOrQuery === "string"
        ? ref(database, pathOrQuery)
        : pathOrQuery;
    dispatchLoading(1);
    try {
      const snapshot = await get(reference);
      const value = snapshot.val();
      dispatchLoading(-1);
      return value;
    } catch (err) {
      dispatchLoading(-1);
      throw err;
    }
  }, []);
  return {
    loading: loading !== 0,
    getServer,
  };
};

export const useLazyGetAndListen = <T = unknown>(): {
  loading: boolean;
  data: T | undefined;
  error: Error | undefined;
  getAndListen: (
    pathOrQuery: string | Query,
    options?: ListenOptions
  ) => Promise<T>;
  clear: () => void;
} => {
  const [pathOrQuery, setPathOrQuery] = useState<string | Query | null>(null);
  const [options, setOptions] = useState<ListenOptions | undefined>();
  const res = useRef<(data: T) => void>(() => {});
  const rej = useRef<(err: Error) => void>(() => {});
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const { forceRerenderCount, forceRerender } = useForceRerender();
  const reference = useMemo(
    () =>
      typeof pathOrQuery === "string"
        ? ref(database, pathOrQuery)
        : pathOrQuery,
    [pathOrQuery]
  );
  const getAndListen = useCallback(
    (pathOrQueryParam: string | Query, optionsParam?: ListenOptions) => {
      setPathOrQuery(pathOrQueryParam);
      setOptions(optionsParam);
      return new Promise<T>((resolve, reject) => {
        res.current = resolve;
        rej.current = reject;
        forceRerender();
      });
    },
    [forceRerender]
  );
  const clear = useCallback(() => {
    rej.current(new Error("Query Cleared"));
    setPathOrQuery(null);
    setOptions(undefined);
    res.current = () => {};
    rej.current = () => {};
    setLoading(false);
    setData(undefined);
    setError(undefined);
  }, []);
  useEffect(() => {
    setData(undefined);
    setError(undefined);
    if (reference) {
      setLoading(true);
      const unsubscribe = onValue(
        reference,
        (snapshot) => {
          const value = snapshot.val();
          setData(value);
          res.current(value);
          setLoading(false);
        },
        (err) => {
          setError(err);
          rej.current(err);
          setLoading(false);
        },
        options ?? {}
      );
      return unsubscribe;
    }
  }, [reference, options, forceRerenderCount]);
  return {
    loading,
    data,
    error,
    getAndListen,
    clear,
  };
};

export const useLazyGetCache = <T = unknown>(): {
  loading: boolean;
  data: T | undefined;
  error: Error | undefined;
  getCache: (
    pathOrQuery: string | Query,
    options?: ListenOptions
  ) => Promise<T>;
  clear: () => void;
} => {
  const { loading, data, error, getAndListen, clear } =
    useLazyGetAndListen<T>();
  const getCache = useCallback(
    (pathOrQuery: string | Query, options?: ListenOptions) => {
      return getAndListen(pathOrQuery, { ...options, onlyOnce: true });
    },
    [getAndListen]
  );
  return { loading, data, error, getCache, clear };
};

type Primitive = string | number | boolean | undefined | null;

export type UpdateType<T, K extends string> = T extends Primitive
  ? T extends undefined
    ? null
    : T
  : T extends Array<infer U>
  ? Array<U>
  : {
      [P in keyof T]: P extends K
        ? T[P] | ReturnType<typeof serverTimestamp>
        : UpdateType<T[P], K>;
    };

export const useUpdate = <T = unknown, K extends string = never>(
  pathOrQuery: string | DatabaseReference
): {
  loading: boolean;
  error: Error | undefined;
  update: (value: Partial<UpdateType<T, K>>) => Promise<void>;
} => {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const reference = useMemo(
    () =>
      typeof pathOrQuery === "string"
        ? ref(database, pathOrQuery)
        : pathOrQuery,
    [pathOrQuery]
  );
  const updateFn = useCallback(
    async (value: Partial<UpdateType<T, K>>) => {
      setLoading((prev) => prev + 1);
      try {
        await update(reference, value);
      } catch (err) {
        setError(err as Error);
        setLoading((prev) => prev - 1);
        throw err;
      }
      setLoading((prev) => prev - 1);
    },
    [reference]
  );
  return { loading: loading !== 0, error, update: updateFn };
};

export const useSet = <T = unknown, K extends string = never>(): {
  loading: boolean;
  error: Error | undefined;
  set: (
    pathOrQuery: string | DatabaseReference,
    value: UpdateType<T, K>
  ) => Promise<void>;
} => {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const setFn = useCallback(
    async (
      pathOrQuery: string | DatabaseReference,
      value: Partial<UpdateType<T, K>>
    ) => {
      const reference =
        typeof pathOrQuery === "string"
          ? ref(database, pathOrQuery)
          : pathOrQuery;
      setLoading((prev) => prev + 1);
      try {
        await set(reference, value);
      } catch (err) {
        setError(err as Error);
        setLoading((prev) => prev - 1);
        throw err;
      }
      setLoading((prev) => prev - 1);
    },
    []
  );
  return { loading: loading !== 0, error, set: setFn };
};

export const useRemove = (): {
  loading: boolean;
  error: Error | undefined;
  remove: (pathOrQuery: string | DatabaseReference) => Promise<void>;
} => {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const removeFn = useCallback((pathOrQuery: string | DatabaseReference) => {
    const reference =
      typeof pathOrQuery === "string"
        ? ref(database, pathOrQuery)
        : pathOrQuery;
    setLoading((prev) => prev + 1);
    return remove(reference)
      .catch((err) => {
        setError(err);
        throw err;
      })
      .finally(() => setLoading((prev) => prev - 1));
  }, []);
  return { loading: loading !== 0, error, remove: removeFn };
};
