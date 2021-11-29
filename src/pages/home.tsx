import React, { useMemo, useContext, useCallback } from "react";
import { signInWithPopup, OAuthProvider, signOut } from "firebase/auth";
import { auth } from "utils/firebase";
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
  const signIn = useCallback(() => {
    signInWithPopup(auth, provider).catch((error) => console.error(error));
  }, [provider]);

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
    <Button color="link" onClick={signIn}>
      Sign In
    </Button>
  );
};

export default Home;
