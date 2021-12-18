import React, { useState, useRef, useEffect, useCallback } from "react";
import { Navbar, Button } from "react-bulma-components";
import { Navigate, Link, Outlet } from "react-router-dom";
import { appName } from "utils/const";
import useUserStatus from "utils/useUserStatus";
import { useSetIcon, useSignOutCallback } from "utils/miscHooks";
import cuhkacsIcon from "static/cuhkacs.ico";

const AdminLayout: React.FunctionComponent = () => {
  const userStatus = useUserStatus();
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

  const signOutCallback = useSignOutCallback();

  useSetIcon(cuhkacsIcon);

  if (!userStatus?.executive) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <div ref={navBarRef}>
        <Navbar
          color="info"
          fixed="top"
          active={isActive}
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            if ((event.target as HTMLElement).tagName === "A") {
              setActive(false);
            }
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
            <Navbar.Container>
              <Navbar.Item hoverable role="menu" tabIndex={0}>
                <Link to="/admin/members" className="navbar-link">
                  Members
                </Link>
                <Navbar.Dropdown>
                  <Link to="/admin/import-members" className="navbar-item">
                    Import Members
                  </Link>
                  <Link to="/admin/members" className="navbar-item">
                    Member List
                  </Link>
                  <Link to="/admin/registrations" className="navbar-item">
                    Registration List
                  </Link>
                </Navbar.Dropdown>
              </Navbar.Item>

              <Navbar.Item hoverable role="menu" tabIndex={0}>
                <Link to="/admin/admins" className="navbar-link">
                  Admins
                </Link>
                <Navbar.Dropdown>
                  <Link to="/admin/admins" className="navbar-item">
                    Admin List
                  </Link>
                  <Link to="/admin/messages" className="navbar-item">
                    Edit Messages
                  </Link>
                </Navbar.Dropdown>
              </Navbar.Item>
            </Navbar.Container>
            <Navbar.Container align="right" className="px-2">
              <Button.Group>
                <Link to="/library" className="button is-light">
                  Library Portal
                </Link>
                <Link to="/member" className="button is-warning">
                  Member Page
                </Link>
                <Button
                  color="danger"
                  className="is-align-self-center"
                  onClick={signOutCallback}
                >
                  Logout
                </Button>
              </Button.Group>
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
