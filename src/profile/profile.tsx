import "./profile.css";
import { AppState } from "../redux/state";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

interface ProfileProps {
    state: AppState
}

export default function Profile(props: ProfileProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/");
        }
    }, []);
    
    return (
        <div>
            <h1>Profile</h1>
        </div>
    );
}