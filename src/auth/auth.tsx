import "./auth.css";
import {
  auth,
  firestore,
  messaging,
} from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "../redux/state";

interface AuthProps {
  logIn: (user: User) => {};
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
    async function redirect() {
      if (auth.currentUser) {
        const data = await getDoc(doc(firestore, `users/${auth.currentUser!.uid}`));
        props.logIn({
          name: auth.currentUser!.displayName!,
          email: auth.currentUser!.email!,
          uid: auth.currentUser!.uid,
          photoURL: auth.currentUser!.photoURL!,
          isAdmin: data.data()!['isAdmin'],
          department: data.data()!['department'],
        });
        navigate(query.get("route") ?? "/home");
      }
    }
    redirect();
  }, [navigate, query, props]);

  async function signIn() {
    try {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        let deviceToken = "";
        try {
          deviceToken = await getToken(messaging, {
            vapidKey:
            "BJ9PFDLMA_LSZPvKTC-59oq3squJWsLCbWfxysed1a7bOIfsCUJ92UcYh1wnyKKlGblk-Whx5nu9p3EXjm-EJzY",
          });
          const firestoreUser = await getDoc(doc(firestore, `users/${credential.user!.uid}`));
          if (!firestoreUser.exists) {
            alert('Your account has not been properly set up. Please contact your administrator to resolve this');
            return;
          }
          if (deviceToken !== "") {
            await updateDoc(firestoreUser.ref, {
              tokens: arrayUnion(deviceToken),
            });
          }
          props.logIn({
            name: credential!.user.displayName!,
            photoURL: credential!.user.photoURL!,
            email: email,
            isAdmin: firestoreUser.data()!['isAdmin'],
            department: firestoreUser.data()!['department'],
            uid: credential!.user.uid,
          });
          navigate(query.get('route') ?? '/home');
        } catch {}
      } catch (e) {
        if (e instanceof Error) {
          alert("The following error has occured whilst logging in: " + e.message);
        }
      }
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
        <h3>Login</h3>
      </button>
    </div>
  );
}
