import "./chat.css";
import { AppState } from "../redux/state";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

interface ChatProps {
    state: AppState;
}

export default function ChatWithOthers(props: ChatProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/?route=/chat-with-others");
        }
    }, [navigate]);

    return (
        <div>
            <h1>Chat with others</h1>
        </div>
    );
}