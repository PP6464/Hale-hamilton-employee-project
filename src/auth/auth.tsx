import "./auth.css";
import { auth, microsoftProvider, firestore } from "../firebase/firebase";
import { updateProfile } from "firebase/auth";
import {
  signInWithPopup,
  OAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { User } from "../redux/state";

interface AuthProps {
  logIn: (user: User, accessToken: string) => {};
}

export default function Auth(props: AuthProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/home");
    }
  }, []);

  async function signInWithMicrosoft() {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const credential = OAuthProvider.credentialFromResult(result)!;
      const accessToken = credential.accessToken!;
      const user = (await signInWithCredential(auth, credential)).user;
      const firestoreUser = await getDoc(doc(firestore, `users/${user.uid}`));
      let isAdmin = false;
      let isNewUser = firestoreUser.exists()
      if (isNewUser) {
        // Retrieve whether or not they are admin
        isAdmin = firestoreUser.get("isAdmin");
      } else {
        // Ask if they are an admin
        while (true) {
          const input = prompt(
            "Are you using an administrator account? Enter 'true' or 'false':"
          );
          if (!(input === "true" || input === "false")) continue;
          isAdmin = input === "true";
          await setDoc(doc(firestore, `users/${user.uid}`), {
            email: user.email ?? "blank-email@circor.com",
            name: user.displayName ?? "Blank display name",
            photo: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            isAdmin: isAdmin,
          });
          await updateProfile(user, {
            photoURL: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          });
          break;
        }
      }
      props.logIn({
        name: user.displayName!,
        photoURL: isNewUser ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" : user.photoURL!,
        email: user.email!,
        isAdmin: isAdmin,
        uid: user.uid,
      }, accessToken);
      navigate("/home");
    } catch {
      alert("An error has occured whilst logging in. Please retry logging in.");
    }
  }

  return (
    <div id="auth-outer">
      <img id="auth-logo" src="/assets/logo-black.svg" alt="" />
      <h1>Login</h1>
      <button id="auth-button" onClick={signInWithMicrosoft}>
        <img src="/assets/microsoft.svg" alt="" />
        <h3>Sign in with Microsoft</h3>
      </button>
    </div>
  );
}
