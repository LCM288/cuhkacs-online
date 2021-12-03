import React, { useState, useRef, useEffect, useCallback } from "react";
import { Navbar } from "react-bulma-components";
import { Link, Outlet } from "react-router-dom";
import { appName } from "utils/const";
import { signOut } from "firebase/auth";
import { auth } from "utils/firebase";
import { toast } from "react-toastify";

const AdminLayout: React.FunctionComponent = () => {
  const navBarRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setActive] = useState(false);

  const toggleActive = useCallback(() => {
    setActive(!isActive);
  }, [isActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navBarRef?.current?.contains(event.target as Node) === false) {
        setActive(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [navBarRef]);

  const signOutCallback = useCallback(() => {
    signOut(auth).then(() => {
      toast.success("You have logged out successfully");
    });
  }, []);

  return (
    <div>
      <div ref={navBarRef}>
        <Navbar
          color="info"
          fixed="top"
          active={isActive}
          onClick={() => {
            if (isActive) setActive(false);
          }}
        >
          <Navbar.Brand>
            <Link to="/admin" className="navbar-item">
              {appName} Admin
            </Link>
            <Navbar.Burger
              onClick={toggleActive}
              onKeyPress={(event: React.KeyboardEvent) =>
                ["Enter", " "].includes(event.key) && toggleActive()
              }
              aria-label="Menu"
              renderAs="a"
            />
          </Navbar.Brand>
          <Navbar.Menu>
            <Navbar.Container align="right">
              <Navbar.Item backgroundColor="danger" onClick={signOutCallback}>
                Logout
              </Navbar.Item>
            </Navbar.Container>
          </Navbar.Menu>
        </Navbar>
      </div>
      <div className="px-4 py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
