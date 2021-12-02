import { useEffect } from "react";

export const useSetTitle = (title: string): void => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
