import { OAuthProvider, signInWithRedirect, signOut } from "firebase/auth";
import {
  useEffect,
  useReducer,
  DispatchWithoutAction,
  useCallback,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import { auth } from "utils/firebase";

export const useSetTitle = (title: string): void => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

export const useSetIcon = (icon: string): void => {
  const iconLink = [...document.head.getElementsByTagName("link")].filter(
    (element) => element.rel === "icon"
  )[0];
  if (!iconLink) {
    return;
  }
  iconLink.href = icon;
};

export const useSignInCallback = (): (() => void) => {
  const provider = useMemo(() => {
    const newProvider = new OAuthProvider("microsoft.com");
    newProvider.setCustomParameters({
      prompt: "select_account",
      domain_hint: "link.cuhk.edu.hk",
      tenant: "link.cuhk.edu.hk",
    });
    return newProvider;
  }, []);
  return useCallback(() => {
    signInWithRedirect(auth, provider).catch((error) => console.error(error));
  }, [provider]);
};

export const useSignOutCallback = (): (() => void) => {
  return useCallback(() => {
    signOut(auth).then(() => {
      toast.success("You have logged out successfully");
    });
  }, []);
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
