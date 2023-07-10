import "./profile.css";
import { AppState } from "../redux/state";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

interface ProfileProps {
  state: AppState;
}

export default function Profile(props: ProfileProps) {
  const navigate = useNavigate();
  const [isModifyingProfile, setIsModifyingProfile] = useState(false);
  const [name, setName] = useState(props.state.user?.name ?? "");
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
      <img
        src={props.state.user?.photoURL}
        alt="User Pic"
        id="profile-user-pic"
      />
      <h1>{props.state.user?.name}</h1>
      <p>
        {props.state.user?.isAdmin ?? false ? "Administrator" : "Normal user"}
      </p>
      <button
        id="modify-profile-button"
        onClick={toggleIsModifyingProfile}
        data-is-modifying={isModifyingProfile}
      >
        Modify Profile
      </button>
      {isModifyingProfile ? (
        <div className="container" style={{ marginTop: "10px" }}>
          <input
            id="profile-name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <button
            id="save-profile-button"
            onClick={() => {
              toggleIsModifyingProfile();
            }}
          >
            Save Changes
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
