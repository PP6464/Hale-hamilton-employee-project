import "./home.css";
import { auth } from "../firebase/firebase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/");
        }
    }, []);

    return (
        <div>
            <h1>Home</h1>
        </div>
    );
}
