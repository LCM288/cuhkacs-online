import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import type { AppUser } from "types/appUser";
import type { Member, Executive } from "types/db";
import { ToastContainer } from "react-toastify";
import { auth, useLazyGetAndListen } from "utils/firebase";
import { toast } from "react-toastify";
import Home from "pages/home";
import AdminLayout from "pages/admin/adminLayout";
import AdminHome from "pages/admin/adminHome";
import EditMessages from "pages/admin/editMessages";
import Admins from "pages/admin/admins";
import Registrations from "pages/admin/registrations";
import Members from "pages/admin/members";
import ImportMembers from "pages/admin/importMembers";
import MemberLayout from "pages/member/memberLayout";
import MemberHome from "pages/member/memberHome";
import Register from "pages/member/register";
import NotFound from "pages/notFound";
import Loading from "components/loading";
import LibraryLayout from "pages/library/libraryLayout";
import LibraryHome from "pages/library/libraryHome";
import LibraryEdit from "pages/library/edit/libraryEdit";
import NewSeries from "pages/library/edit/series/newSeries";
import EditSeries from "pages/library/edit/series/book/editSeries";
import EditSeriesHome from "pages/library/edit/series/editSeriesHome";
import BrowseSeries from "pages/library/browse/browseSeries";
import BrowseBooks from "pages/library/browse/books/browseBooks";
import SearchMode from "pages/library/search/searchMode";
import SearchBy from "pages/library/search/searchBy";

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

const getSidOfUser = (user: User): string =>
  user.email?.endsWith("@link.cuhk.edu.hk")
    ? user.email.replace("@link.cuhk.edu.hk", "")
    : "";

const App = (): React.ReactElement => {
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);
  const [user, setUser] = useState<AppUser | null>(null);
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
  const authFirstLoadingRef = useRef(true);

  const authFirstLoadingFinishedCallbackRef = useRef(() => {
    setAuthFirstLoading(false);
    authFirstLoadingRef.current = false;
  });
  const getAndListenMemberRef = useRef(getAndListenMember);
  const clearListenMemberRef = useRef(clearListenMember);
  const getAndListenExecutiveRef = useRef(getAndListenExecutive);
  const clearListenExecutiveRef = useRef(clearListenExecutive);

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
        if (!newUser.email?.endsWith("@link.cuhk.edu.hk")) {
          signOut(auth);
          toast.error(`Login error, cannot get sid`);
        } else {
          if (!authFirstLoadingRef.current) {
            toast.success(
              `You have successfully signed in as ${
                newUser.displayName ?? "user"
              }`
            );
          }
          setAuthUser(newUser);
          const sid = getSidOfUser(newUser);
          // Errors will be handled elsewhere
          getAndListenMemberRef.current(`members/${sid}`).catch(() => {});
          getAndListenExecutiveRef.current(`executives/${sid}`).catch(() => {});
        }
      } else {
        setAuthUser(null);
        setUser(null);
        clearListenMemberRef.current();
        clearListenExecutiveRef.current();
        if (authFirstLoadingRef.current) {
          authFirstLoadingFinishedCallbackRef.current();
        }
      }
    });
  }, []);

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

  useEffect(() => {
    if (authUser && memberData !== undefined && executiveData !== undefined) {
      setUser({
        sid: getSidOfUser(authUser),
        displayName: executiveData?.displayName ?? authUser.displayName ?? "",
        member: memberData,
        executive: executiveData,
      });
      if (authFirstLoadingRef.current) {
        authFirstLoadingFinishedCallbackRef.current();
      }
    }
  }, [authUser, memberData, executiveData]);

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
          {!authFirstLoading && (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Outlet />}>
                  <Route index element={<Home />} />
                  <Route path="/library" element={<LibraryLayout />}>
                    <Route index element={<LibraryHome />} />
                    <Route path="edit" element={<LibraryEdit />}>
                      <Route index element={<NotFound />} />
                      <Route path="series" element={<Outlet />}>
                        <Route index element={<EditSeriesHome />} />
                        <Route path="new" element={<NewSeries />} />
                        <Route path="books" element={<Outlet />}>
                          <Route index element={<NotFound />} />
                          <Route path=":seriesId" element={<EditSeries />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="browse" element={<Outlet />}>
                      <Route index element={<BrowseSeries />} />
                      <Route path="books" element={<Outlet />}>
                        <Route index element={<NotFound />} />
                        <Route path=":seriesId" element={<BrowseBooks />} />
                      </Route>
                    </Route>
                    <Route path="search" element={<Outlet />}>
                      <Route path=":searchMode" element={<SearchMode />}>
                        <Route index element={<NotFound />} />
                        <Route path=":searchParam" element={<SearchBy />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/member" element={<MemberLayout />}>
                    <Route index element={<MemberHome />} />
                    <Route path="register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminHome />} />
                    <Route path="import-members" element={<ImportMembers />} />
                    <Route path="members" element={<Members />} />
                    <Route path="registrations" element={<Registrations />} />
                    <Route path="admins" element={<Admins />} />
                    <Route path="messages" element={<EditMessages />} />
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
