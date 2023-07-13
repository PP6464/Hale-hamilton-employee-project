import './121.css';
import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { auth, firestore } from "../../firebase/firebase";
import { onSnapshot, query, orderBy, collection } from "firebase/firestore";

export default function OneToOneChat() {
    return (
        <div>
            <h1>121 Chat</h1>
        </div>
    );    
}