import './121.css';
import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { auth, firestore } from "../../firebase/firebase";
import { onSnapshot, query, orderBy, collection } from "firebase/firestore";

export default function OneToOneChat() {
    const navigate = useNavigate();
    const { uid } = useParams();

    useEffect(() => {
        if (auth.currentUser === null) {
            navigate(`/?route=/chat/121/${uid}`)
        }
    }, [navigate]);

    return (
        <div>
            <h1>121 Chat</h1>
        </div>
    );    
}