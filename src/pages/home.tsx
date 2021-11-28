import React, { useMemo, useContext } from "react";
import {
  getAuth,
  signInWithPopup,
  OAuthProvider,
  signOut,
} from "firebase/auth";
import { Button } from "react-bulma-components";
import { UserContext } from "app";

const Home = (): React.ReactElement => {
  const user = useContext(UserContext);
  const provider = useMemo(() => {
    const newProvider = new OAuthProvider("microsoft.com");
    newProvider.setCustomParameters({
      prompt: "select_account",
      domain_hint: "link.cuhk.edu.hk",
      tenant: "link.cuhk.edu.hk",
    });
    return newProvider;
  }, []);

  const auth = useMemo(() => getAuth(), []);

  if (user) {
    return (
      <>
        <div>{JSON.stringify(user)}</div>
        <Button color="link" onClick={() => signOut(auth)}>
          Sign Out
        </Button>
      </>
    );
  }

  return (
    <Button color="link" onClick={() => signInWithPopup(auth, provider)}>
      Sign In
    </Button>
  );
};

export default Home;
