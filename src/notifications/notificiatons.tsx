import "./notifications.css";
import { AppState } from "../redux/state";
import { auth, firestore } from "../firebase/firebase";
import { onSnapshot, collection, query, where, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface NotificationsProps {
    state: AppState;
}

interface Notification {
    title: string;
    body: string;
    time: Date;
    read: boolean;
}

export default function Notifications(props: NotificationsProps) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/");
        }
    }, [navigate]);
    useEffect(() => {
        setLoading(true);
        onSnapshot(
            query(collection(firestore, 'notifications'), where("users", "array-contains", doc(firestore, `users/${props.state.user?.uid}`))),
            (snapshot) => {
                setNotifications(snapshot.docs.map((e) => {
                    return {
                        title: e.data()['title'],
                        body: e.data()['body'],
                        time: e.data()['time'].toDate(),
                        read: e.data()['readBy']?.includes(doc(firestore, `users/${props.state.user?.uid}`)) ?? false,
                    };
                }));
                setLoading(false);
            },
        );
        }, [props.state.user?.uid]);

    return loading ? (
        <p>Loading...</p>
    ) : notifications.length !== 0 ? (
        <div className="container">
            <h1>Notifications</h1>
            <div style={{display: "flex", alignItems: "center"}}></div>
        </div>
    ) : (
        <div className="container">
            <h1>Notifications</h1>
            <p>No notifications to display</p>
        </div>
    );
}