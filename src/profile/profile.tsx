import "./profile.css";
import { AppState } from "../redux/state";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore, storage } from "../firebase/firebase";
import { uploadString, ref, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";

interface ProfileProps {
  state: AppState;
  updateUser: (name?: string, photoURL?: string) => void;
}

export default function Profile(props: ProfileProps) {
  const navigate = useNavigate();
  const [isModifyingProfile, setIsModifyingProfile] = useState(false);
  const [name, setName] = useState(props.state.user?.name ?? "");
  const [filePic, setFilePic] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState(
    props.state.user?.photoURL ??
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  );

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, []);

  function toggleIsModifyingProfile() {
    setIsModifyingProfile(!isModifyingProfile);
  }

  return (
    <div className="container">
      {isModifyingProfile ? (
        <div className="container" style={{ marginTop: "10px" }}>
          <img
            src={filePic !== null ? filePic : photoURL}
            alt="User Pic"
            id="profile-user-pic"
          />
          <input
            id="profile-name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <p>Photo options:</p>
          <label htmlFor="choose-file" style={{ marginTop: "5px" }}>
            <button
              id="choose-file-button"
              onClick={() => {
                document.getElementById("choose-file")!.click();
              }}
            >
              Choose file
            </button>
          </label>
          <input
            style={{ display: "none" }}
            id="choose-file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                let reader = new FileReader();
                reader.onload = function (ev: ProgressEvent<FileReader>) {
                  setFilePic((ev.target?.result as string | null) ?? null);
                };
                reader.readAsDataURL(e.target.files[0]);
              }
            }}
          />
          <button
            id="use-initials-button"
            onClick={() => {
              setFilePic(null);
              setPhotoURL(
                `https://ui-avatars.com/api/?name=${name}&background=random&size=128`
              );
            }}
          >
            Use initials
          </button>
          <button
            id="revert-to-normal-button"
            onClick={() => {
              setFilePic(null);
              setPhotoURL(
                props.state.user?.photoURL ??
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              );
            }}
          >
            Revert to normal
          </button>
          <button
            id="save-profile-button"
            onClick={async (e) => {
              e.preventDefault();
              if (filePic !== null) {
                const result = await uploadString(
                  ref(
                    storage,
                    `/users/${props.state.user!.uid}/profile_pic.${
                      filePic.split(";")[0].split("/")[1].split("+")[0]
                    }`
                  ),
                  filePic,
                  "data_url"
                );
                setPhotoURL(await getDownloadURL(result.ref));
              }
              await updateProfile(auth.currentUser!, {
                displayName: name,
                photoURL: photoURL,
              });
              await updateDoc(
                doc(firestore, `users/${props.state.user!.uid}`),
                {
                  name: name,
                  photoURL: photoURL,
                }
              );
              props.updateUser(name, photoURL);
              toggleIsModifyingProfile();
              return false;
            }}
          >
            Save Changes
          </button>
        </div>
      ) : (
        <div className="container">
          <img
            src={props.state.user?.photoURL}
            alt="User Pic"
            id="profile-user-pic"
          />
          <h1>{props.state.user?.name}</h1>
          <p>
            {props.state.user?.isAdmin ?? false
              ? "Administrator"
              : "Normal user"}
          </p>
          <button
            id="modify-profile-button"
            onClick={toggleIsModifyingProfile}
            data-is-modifying={isModifyingProfile}
          >
            Modify Profile
          </button>
        </div>
      )}
    </div>
  );
}
