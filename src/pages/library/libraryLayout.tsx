import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button, Navbar, Image as BulmaImage } from "react-bulma-components";
import { Link, Outlet } from "react-router-dom";
import useUserStatus from "utils/useUserStatus";
import indexLogo from "static/indexLogo.png";
import indexIcon from "static/indexIcon.ico";
import {
  useSetIcon,
  useSignInCallback,
  useSignOutCallback,
} from "utils/miscHooks";

const LibraryLayout: React.FunctionComponent = () => {
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

  const signInCallback = useSignInCallback();

  const signOutCallback = useSignOutCallback();

  useSetIcon(indexIcon);

  return (
    <div>
      <div ref={navBarRef}>
        <Navbar
          color="light"
          fixed="top"
          active={isActive}
          onClick={() => {
            if (isActive) setActive(false);
          }}
        >
          <Navbar.Brand>
            <Link to="/library" className="navbar-item">
              <BulmaImage src={indexLogo} />
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
              {userStatus ? (
                <Button
                  color="danger"
                  className="is-align-self-center"
                  onClick={signOutCallback}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  color="link"
                  className="is-align-self-center"
                  onClick={signInCallback}
                  renderAs="a"
                >
                  Login with CUHK OnePass
                </Button>
              )}
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

export default LibraryLayout;
