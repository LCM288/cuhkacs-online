import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { AppUser } from "types/appUser";
import type { Member, Executive } from "types/db";
import { ToastContainer } from "react-toastify";
import { auth, useLazyGetAndListen } from "utils/firebase";
import { toast } from "react-toastify";
import Home from "pages/home";
import AdminLayout from "pages/admin/adminLayout";
import AdminHome from "pages/admin/adminHome";
import MemberLayout from "pages/member/memberLayout";
import MemberHome from "pages/member/memberHome";
import Register from "pages/member/register";
import NotFound from "pages/notFound";
import Loading from "components/loading";

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
  const {
    loading: memberLoading,
    data: memberData,
    error: memberError,
    getAndListen: getAndListenMember,
    clear: clearListenMember,
  } = useLazyGetAndListen<Member | null>();
  const {
    loading: executiveLoading,
    data: executiveData,
    error: executiveError,
    getAndListen: getAndListenExecutive,
    clear: clearListenExecutive,
  } = useLazyGetAndListen<Executive | null>();

  const clipCount = useRef(0);
  const [authFirstLoading, setAuthFirstLoading] = useState(true);
  const [memberFirstLoading, setMemberFirstLoading] = useState(true);
  const [executiveFirstLoading, setExecutiveFirstLoading] = useState(true);

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
    if (authFirstLoading) {
      onAuthStateChanged(auth, (newUser) => {
        if (newUser) {
          if (!newUser.email?.endsWith("@link.cuhk.edu.hk")) {
            signOut(auth);
            toast.error(`Login error, cannot get sid`);
          } else {
            if (!authFirstLoading) {
              toast.success(
                `You have successfully signed in as ${
                  newUser.displayName ?? "user"
                }`
              );
            } else {
              setMemberFirstLoading(true);
              setExecutiveFirstLoading(true);
            }
            const sid = newUser.email.replace("@link.cuhk.edu.hk", "");
            setUser({
              ...newUser,
              sid,
            });
            // Errors will be handled elsewhere
            getAndListenMember(`members/${sid}`)
              .catch(() => {})
              .finally(() => {
                setMemberFirstLoading(false);
              });
            getAndListenExecutive(`executives/${sid}`)
              .catch(() => {})
              .finally(() => {
                setExecutiveFirstLoading(false);
              });
          }
        } else {
          setUser(null);
          clearListenMember();
          clearListenExecutive();
        }
        setAuthFirstLoading(false);
      });
    }
  }, [
    authFirstLoading,
    clearListenMember,
    clearListenExecutive,
    getAndListenMember,
    getAndListenExecutive,
  ]);

  useEffect(() => {
    setUser((prevUser) =>
      prevUser
        ? {
            ...prevUser,
            member: memberData ?? undefined,
          }
        : prevUser
    );
  }, [memberData]);

  useEffect(() => {
    setUser((prevUser) =>
      prevUser
        ? {
            ...prevUser,
            executive: executiveData ?? undefined,
          }
        : prevUser
    );
  }, [executiveData]);

  useEffect(() => {
    if (memberError) {
      console.error(memberError);
      toast.error(memberError.message);
    }
  }, [memberError]);

  useEffect(() => {
    if (executiveError) {
      console.error(executiveError);
      toast.error(executiveError.message);
    }
  }, [executiveError]);

  return (
    <>
      <UserContext.Provider value={user}>
        <ClipCountContext.Provider
          value={{
            add: addClipCount,
            remove: removeClipCount,
          }}
        >
          <Loading
            loading={authFirstLoading || memberLoading || executiveLoading}
          />
          {!authFirstLoading && !memberFirstLoading && !executiveFirstLoading && (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Outlet />}>
                  <Route index element={<Home />} />
                  <Route path="/member" element={<MemberLayout />}>
                    <Route index element={<MemberHome />} />
                    <Route path="register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminHome />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          )}
        </ClipCountContext.Provider>
      </UserContext.Provider>
      <ToastContainer closeButton={BulmaCloseBtn} />
    </>
  );
};

export default App;
