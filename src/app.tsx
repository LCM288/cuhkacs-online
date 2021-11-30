import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue, off, DataSnapshot } from "firebase/database";
import type { AppUser } from "types/appUser";
import type { Member, Executive } from "types/db";
import { ToastContainer } from "react-toastify";
import { auth, database } from "utils/firebase";
import { toast } from "react-toastify";
import Home from "pages/home";
import MemberLayout from "pages/member/memberLayout";
import MemberHome from "pages/member/memberHome";
import NotFound from "pages/notFound";

export const UserContext = React.createContext<AppUser | null>(null);

export const ClipCountContext = React.createContext({
  add: () => {},
  remove: () => {},
});

const BulmaCloseBtn = ({
  closeToast,
}: {
  closeToast: () => void;
}): React.ReactElement => <button onClick={closeToast} className="delete" />;

const App = (): React.ReactElement => {
  const [user, setUser] = useState<AppUser | null>(auth.currentUser);
  const [loginState, setLoginState] = useState<boolean>(Boolean(user));
  const userRef = useRef<User | null>(user);

  const clipCount = useRef(0);

  const addClipCount = useCallback(() => {
    if (clipCount.current === 0) {
      document.scrollingElement?.classList.add("is-clipped");
    }
    clipCount.current += 1;
  }, []);

  const removeClipCount = useCallback(() => {
    clipCount.current -= 1;
    if (clipCount.current === 0) {
      document.scrollingElement?.classList.remove("is-clipped");
    }
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (newUser) => {
      if (newUser) {
        toast.success(
          `You have successfully signed in as ${newUser.displayName ?? "user"}`
        );
      }
      setUser(newUser);
      userRef.current = newUser;
      setLoginState(Boolean(newUser));
    });
  }, []);

  useEffect(() => {
    if (loginState) {
      if (!userRef.current) {
        console.error("Login state user mismatch");
        signOut(auth);
        return;
      }
      if (!userRef.current.email?.endsWith("@link.cuhk.edu.hk")) {
        console.error(`Unknown user email ${userRef.current.email}`);
        signOut(auth);
        return;
      }
      const sid = userRef.current.email.replace("@link.cuhk.edu.hk", "");
      const memberRef = ref(database, `members/${sid}`);
      const memberQueryCallback = (snapshot: DataSnapshot) => {
        setUser((prev) => {
          if (!prev) {
            return prev;
          }
          const member = (snapshot.val() ?? undefined) as Member | undefined;
          return {
            ...prev,
            member,
          };
        });
      };
      onValue(memberRef, memberQueryCallback);
      const executiveRef = ref(database, `executives/${sid}`);
      const executiveQueryCallback = (snapshot: DataSnapshot) => {
        setUser((prev) => {
          if (!prev) {
            return prev;
          }
          const executive = (snapshot.val() ?? undefined) as
            | Executive
            | undefined;
          return {
            ...prev,
            executive,
          };
        });
      };
      onValue(executiveRef, executiveQueryCallback);
      return () => {
        off(memberRef, "value", memberQueryCallback);
        off(executiveRef, "value", executiveQueryCallback);
      };
    }
  }, [loginState]);

  return (
    <>
      <UserContext.Provider value={user}>
        <ClipCountContext.Provider
          value={{
            add: addClipCount,
            remove: removeClipCount,
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Outlet />}>
                <Route index element={<Home />} />
                <Route path="/member" element={<MemberLayout />}>
                  <Route index element={<MemberHome />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ClipCountContext.Provider>
      </UserContext.Provider>
      <ToastContainer closeButton={BulmaCloseBtn} />
    </>
  );
};

export default App;
