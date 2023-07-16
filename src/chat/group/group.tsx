import "./group.css";
import { useEffect, useState } from "react";
import { auth, firestore } from "../../firebase/firebase";
import { useNavigate, Link, useParams } from "react-router-dom";
import { onSnapshot, query, orderBy, collection } from "firebase/firestore";

export default function GroupChat() {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (auth.currentUser === null) {
            navigate(`/?route=/chat/group/${id}`)
        }
    }, [navigate, id]);

    return (
        <div>Group Chat</div>
    );
}