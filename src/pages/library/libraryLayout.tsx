import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  Navbar,
  Image as BulmaImage,
  Form,
  Icon,
} from "react-bulma-components";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useUserStatus from "utils/useUserStatus";
import indexLogo from "static/indexLogo.png";
import indexIcon from "static/indexIcon.ico";
import {
  useSetIcon,
  useSignInCallback,
  useSignOutCallback,
} from "utils/miscHooks";
import { appName } from "utils/const";
import { PreventDefaultForm } from "utils/domEventHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const { Field, Control, Input } = Form;

const LibraryLayout: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const userStatus = useUserStatus();
  const navBarRef = useRef<HTMLDivElement | null>(null);
  const [searchInput, setSearchInput] = useState("");
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
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            if ((event.target as HTMLElement).tagName === "A" && isActive) {
              setActive(false);
            }
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
            <Navbar.Container className="is-flex-grow-1">
              <Navbar.Item hoverable role="menu" tabIndex={0}>
                <Link to="/library/browse" className="navbar-link">
                  Browse
                </Link>
                <Navbar.Dropdown>
                  <Link to="/library/browse" className="navbar-item">
                    Last Updated Series
                  </Link>
                  <Link to="/library/browse/popular" className="navbar-item">
                    Popular Series
                  </Link>
                </Navbar.Dropdown>
              </Navbar.Item>

              {userStatus?.executive && (
                <Navbar.Item hoverable role="menu" tabIndex={0}>
                  <Navbar.Link renderAs="div">Library Admin</Navbar.Link>
                  <Navbar.Dropdown>
                    <Link to="/library/borrowing" className="navbar-item">
                      Borrow &amp; Return
                    </Link>
                    <Link to="/library/edit/series" className="navbar-item">
                      Edit Series
                    </Link>
                    <Link to="/library/edit/series/new" className="navbar-item">
                      Add New Series
                    </Link>
                  </Navbar.Dropdown>
                </Navbar.Item>
              )}
              <Navbar.Item className="is-expanded" renderAs="div">
                <PreventDefaultForm
                  onSubmit={() => {
                    if (searchInput) {
                      navigate(`/library/search/keyword/${searchInput}`);
                    } else {
                      navigate(`/library/browse`);
                    }
                    setActive(false);
                  }}
                  style={{ width: "100%" }}
                >
                  <Field kind="addons">
                    <Control fullwidth>
                      <Input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search for a series..."
                      />
                    </Control>
                    <Control>
                      <Button type="submit">
                        <Icon>
                          <FontAwesomeIcon icon={faSearch} />
                        </Icon>
                      </Button>
                    </Control>
                  </Field>
                </PreventDefaultForm>
              </Navbar.Item>
            </Navbar.Container>
            <Navbar.Container align="right" className="px-2">
              <Button.Group>
                {userStatus ? (
                  <>
                    <Link to="/member" className="button is-warning">
                      Member Page
                    </Link>
                    {userStatus.executive && (
                      <Link to="/admin" className="button is-info">
                        Admin Portal
                      </Link>
                    )}
                    <Button
                      color="danger"
                      className="is-align-self-center"
                      onClick={signOutCallback}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/" className="button is-primary">
                      {appName} Home Page
                    </Link>
                    <Button
                      color="link"
                      className="is-align-self-center"
                      onClick={signInCallback}
                    >
                      Login with CUHK OnePass
                    </Button>
                  </>
                )}
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

export default LibraryLayout;
