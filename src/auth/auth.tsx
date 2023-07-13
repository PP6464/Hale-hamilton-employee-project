import "./auth.css";
import {
  auth,
  firestore,
  messaging,
} from "../firebase/firebase";
import { updateProfile } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "../redux/state";

interface AuthProps {
  logIn: (user: User, accessToken: string) => {};
}

export default function Auth(props: AuthProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const query = useQuery();
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  useEffect(() => {
    if (auth.currentUser) {
      navigate(query.get("route") ?? "/home");
    }
  }, [navigate]);

  async function signIn() {
    try {
      if (!email.match('^[\\w-]+@[\\w-]+.[a-zA-Z]+$')) {
        alert("Incorrectly formatted email");
        setEmail('');
        return;
      }
      if (password.length < 10) {
        alert("Password too short: needs to be at least 10 characters");
        setPassword('');
        return;
      }
      let credential: UserCredential | null = null;
      try {
        credential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (e) {
        try {
          credential = await signInWithEmailAndPassword(auth, email, password);
        } catch {
          alert("There has been an error whilst logging in. Please check that your detail sare correct and retry.");
        }
      }
      const firestoreUser = await getDoc(doc(firestore, `users/${credential!.user.uid}`));
      let isExistingUser = firestoreUser.exists();
      let isAdmin = false;
      let deviceToken = "";
      try {
        deviceToken = await getToken(messaging, {
          vapidKey:
            "BJ9PFDLMA_LSZPvKTC-59oq3squJWsLCbWfxysed1a7bOIfsCUJ92UcYh1wnyKKlGblk-Whx5nu9p3EXjm-EJzY",
        });
      } catch {}
      if (isExistingUser) {
        // Retrieve whether or not they are admin
        isAdmin = firestoreUser.get("isAdmin");
        if (deviceToken !== "")
          await updateDoc(firestoreUser.ref, {
            tokens: arrayUnion(deviceToken),
          });
      } else {
        let name = null;
        while (name === null) {
          name = prompt("What is your name?");
        }
        // Ask if they are an admin
        while (true) {
          const input = prompt(
            "Are you using an administrator account? Enter 'true' or 'false':"
          );
          if (!(input === "true" || input === "false")) continue;
          isAdmin = input === "true";
          await setDoc(firestoreUser.ref, {
            email: email,
            name: name,
            photoURL:
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            isAdmin: isAdmin,
            tokens: deviceToken !== "" ? [deviceToken] : null,
          });
          await updateProfile(credential!.user, {
            displayName: name,
            photoURL:
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          });
          await auth.currentUser?.reload();
          break;
        }
      }
      props.logIn(
        {
          name: credential!.user.displayName!,
          photoURL: isExistingUser
            ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            : credential!.user.photoURL!,
          email: email,
          isAdmin: isAdmin,
          uid: credential!.user.uid,
        },
        "",
      );
      navigate(query.get("route") ?? "/home");
    } catch (e: any) {
      if (!(e instanceof Error)) return;
      console.error(e.message);
      console.error(e.stack);
      alert("An error has occured whilst logging in. Please retry logging in.");
    }
  }

  return (
    <div id="auth-outer">
      <img id="auth-logo" src="/assets/logo-black.svg" alt="" />
      <h1>Login</h1>
      <input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} type="email"/>
      <input placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} type="password"/>
      <button id="auth-button" onClick={signIn}>
        <h3>Sign in</h3>
      </button>
    </div>
  );
}
