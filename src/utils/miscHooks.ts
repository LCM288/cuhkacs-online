import { useEffect, useReducer, DispatchWithoutAction } from "react";

export const useSetTitle = (title: string): void => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

export const useForceRerender = (): {
  forceRerenderCount: number;
  forceRerender: DispatchWithoutAction;
} => {
  const [forceRerenderCount, forceRerender] = useReducer(
    (state) => state + 1,
    0
  );
  return { forceRerenderCount, forceRerender };
};
