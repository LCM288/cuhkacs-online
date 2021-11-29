import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "utils/firebase";
import Home from "pages/home";
import NotFound from "pages/notFound";

export const UserContext = React.createContext<User | null>(null);

const App = (): React.ReactElement => {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
    });
  }, []);

  return (
    <UserContext.Provider value={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

export default App;
