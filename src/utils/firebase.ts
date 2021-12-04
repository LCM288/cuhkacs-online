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
  options: ListenOptions = {}
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
      options
    );
    return unsubscribe;
  }, [reference, options]);
  return { loading, data, error };
};

export const useGetCache = <T = unknown>(
  pathOrRef: string | DatabaseReference,
  options: ListenOptions = {}
): { loading: boolean; data: T | undefined; error: Error | undefined } => {
  return useGetAndListen(pathOrRef, { ...options, onlyOnce: true });
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
      setLoading(true);
      setData(undefined);
      setError(undefined);
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
    if (reference) {
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
  return { loading, data, error, getServer, clear };
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
  const [options, setOptions] = useState<ListenOptions>({});
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
      optionsParam: ListenOptions = {}
    ) => {
      setPathOrRef(pathOrRefParam);
      setOptions(optionsParam);
      setLoading(true);
      setData(undefined);
      setError(undefined);
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
    setOptions({});
    res.current = () => {};
    rej.current = () => {};
    setLoading(false);
    setData(undefined);
    setError(undefined);
  }, []);
  useEffect(() => {
    if (reference) {
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
        options
      );
      return unsubscribe;
    }
  }, [reference, options]);
  return { loading, data, error, getAndListen, clear };
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

export const useUpdate = <T = unknown>(
  pathOrRef: string | DatabaseReference
): {
  loading: boolean;
  error: Error | undefined;
  update: (value: Partial<T>) => Promise<void>;
} => {
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const reference = useMemo(
    () =>
      typeof pathOrRef === "string" ? ref(database, pathOrRef) : pathOrRef,
    [pathOrRef]
  );
  const updateFn = useCallback(
    (value: Partial<T>) => {
      setLoading((prev) => prev + 1);
      return update(reference, value)
        .catch((err) => {
          setError(err);
          throw err;
        })
        .finally(() => setLoading((prev) => prev - 1));
    },
    [reference]
  );
  return { loading: loading !== 0, error, update: updateFn };
};
