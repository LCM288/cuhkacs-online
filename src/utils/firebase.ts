import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
} from "firebase/database";

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
  pathOrRef: string | DatabaseReference
): { loading: boolean; data: T | undefined; error: Error | undefined } => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const reference = useMemo(
    () =>
      typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef,
    [pathOrRef]
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
  pathOrRef: string | DatabaseReference,
  options?: ListenOptions
): { loading: boolean; data: T | undefined; error: Error | undefined } => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const reference = useMemo(
    () =>
      typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef,
    [pathOrRef]
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
  pathOrRef: string | DatabaseReference,
  options?: ListenOptions
): { loading: boolean; data: T | undefined; error: Error | undefined } => {
  const getCacheOption = useMemo(
    () => ({ ...options, onlyOnce: true }),
    [options]
  );
  return useGetAndListen(pathOrRef, getCacheOption);
};

export const useLazyGetServer = <T = unknown>(): {
  loading: boolean;
  data: T | undefined;
  error: Error | undefined;
  getServer: (pathOrRef: string | DatabaseReference) => Promise<T>;
  clear: () => void;
} => {
  const [pathOrRef, setPathOrRef] = useState<string | DatabaseReference | null>(
    null
  );
  const res = useRef<(data: T) => void>(() => {});
  const rej = useRef<(err: Error) => void>(() => {});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const reference = useMemo(
    () =>
      typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef,
    [pathOrRef]
  );
  const getServer = useCallback(
    (pathOrRefParam: string | DatabaseReference) => {
      setPathOrRef(pathOrRefParam);
      return new Promise<T>((resolve, reject) => {
        res.current = resolve;
        rej.current = reject;
      });
    },
    []
  );
  const clear = useCallback(() => {
    rej.current(new Error("Query Cleared"));
    setPathOrRef(null);
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
      get(reference)
        .then((snapshot) => {
          const value = snapshot.val();
          setData(value);
          res.current(value);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          rej.current(err);
          setLoading(false);
        });
    }
  }, [reference]);
  return {
    loading,
    data,
    error,
    getServer,
    clear,
  };
};

export const useLazyGetAndListen = <T = unknown>(): {
  loading: boolean;
  data: T | undefined;
  error: Error | undefined;
  getAndListen: (
    pathOrRef: string | DatabaseReference,
    options?: ListenOptions
  ) => Promise<T>;
  clear: () => void;
} => {
  const [pathOrRef, setPathOrRef] = useState<string | DatabaseReference | null>(
    null
  );
  const [options, setOptions] = useState<ListenOptions | undefined>();
  const res = useRef<(data: T) => void>(() => {});
  const rej = useRef<(err: Error) => void>(() => {});
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const reference = useMemo(
    () =>
      typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef,
    [pathOrRef]
  );
  const getAndListen = useCallback(
    (
      pathOrRefParam: string | DatabaseReference,
      optionsParam?: ListenOptions
    ) => {
      setPathOrRef(pathOrRefParam);
      setOptions(optionsParam);
      return new Promise<T>((resolve, reject) => {
        res.current = resolve;
        rej.current = reject;
      });
    },
    []
  );
  const clear = useCallback(() => {
    rej.current(new Error("Query Cleared"));
    setPathOrRef(null);
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
  }, [reference, options]);
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
    pathOrRef: string | DatabaseReference,
    options?: ListenOptions
  ) => Promise<T>;
  clear: () => void;
} => {
  const { loading, data, error, getAndListen, clear } =
    useLazyGetAndListen<T>();
  const getCache = useCallback(
    (pathOrRef: string | DatabaseReference, options?: ListenOptions) => {
      return getAndListen(pathOrRef, { ...options, onlyOnce: true });
    },
    [getAndListen]
  );
  return { loading, data, error, getCache, clear };
};

type Primitive = string | number | boolean | undefined | null;

export type UpdateType<T, K extends keyof T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? Array<U>
  : {
      [P in keyof T]: P extends K
        ? T[P] | ReturnType<typeof serverTimestamp>
        : T[P];
    };

export const useUpdate = <T = unknown, K extends keyof T = never>(
  pathOrRef: string | DatabaseReference
): {
  loading: boolean;
  error: Error | undefined;
  update: (value: Partial<UpdateType<T, K>>) => Promise<void>;
} => {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const reference = useMemo(
    () =>
      typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef,
    [pathOrRef]
  );
  const updateFn = useCallback(
    async (value: Partial<UpdateType<T, K>>) => {
      setLoading((prev) => prev + 1);
      try {
        await update(reference, value);
      } catch (err) {
        console.log(err);
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

export const useSet = <T = unknown, K extends keyof T = never>(): {
  loading: boolean;
  error: Error | undefined;
  set: (
    pathOrRef: string | DatabaseReference,
    value: UpdateType<T, K>
  ) => Promise<void>;
} => {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const setFn = useCallback(
    async (
      pathOrRef: string | DatabaseReference,
      value: Partial<UpdateType<T, K>>
    ) => {
      const reference =
        typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef;
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
  remove: (pathOrRef: string | DatabaseReference) => Promise<void>;
} => {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const removeFn = useCallback((pathOrRef: string | DatabaseReference) => {
    const reference =
      typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef;
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
