import "./notifications.css";
import { AppState } from "../redux/state";
import { auth } from "../firebase/firebase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface NotificationsProps {
    state: AppState;
}

export default function Notifications(props: NotificationsProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div>
            <h1>Notifications</h1>
        </div>
    );
}