import "./notifications.css";
import { AppState } from "../redux/state";
import { auth, firestore } from "../firebase/firebase";
import { onSnapshot, collection, query, where, doc, arrayRemove, arrayUnion, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { DocumentReference } from "firebase/firestore";

interface NotificationsProps {
    state: AppState;
}

interface Notification {
    title: string;
    body: string;
    time: Date;
    read: boolean;
    id: string;
}

export default function Notifications(props: NotificationsProps) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<"read"|"unread"|"all">("unread");
    const [order, setOrder] = useState<"asc"|"desc">("desc");
    const [isShowingFilter, setIsShowingFilter] = useState(false);
    
    function formatDate(date: Date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, "0")}/${date.getMonth().toString().padStart(2, "0")}/${date.getFullYear()}`;
    }
    
    function normalise(a: number) {
        return a / Math.abs(a);
    }

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/?route=notifications");
        }
    }, [navigate]);
    useEffect(() => {
        setLoading(true);
        onSnapshot(
            query(collection(firestore, 'notifications'), where("users", "array-contains", doc(firestore, `users/${props.state.user?.uid}`))),
            (snapshot) => {
                setNotifications(
                    snapshot.docs.map((e) => {
                        return {
                            title: e.data()['title'],
                            body: e.data()['body'],
                            time: e.data()['time'].toDate(),
                            read: (e.data()['readBy'] as DocumentReference[])?.map((e) => e.path).includes(doc(firestore, `users/${props.state.user?.uid}`).path) ?? false,
                            id: e.id,
                        };
                    }).filter((e) => {
                        switch (filter) {
                            case "read":
                                return e.read;
                            case "unread":
                                return !e.read;
                            case "all":
                                return true;
                            default:
                                return true;
                        }
                    }).sort((a, b) => {
                        return (order === "desc" ? 1 : -1) * normalise(b.time.valueOf() - a.time.valueOf());
                    })
                );
                setLoading(false);
            },
        );
        }, [props.state.user?.uid, filter, order]);

    return loading ? (
        <p>Loading...</p>
    ) : (
        <div className="container">
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "10px"}}>
                <h1>Notifications</h1>
                <IconButton
                    style={{marginLeft: "5px"}}
                    title={isShowingFilter ? "Hide filters" : "Show filters"}
                    onClick={() => setIsShowingFilter(!isShowingFilter)}>
                    {isShowingFilter ? <FilterAltOffIcon/> : <FilterAltIcon/>}
                </IconButton>                
            </div>
            <div style={{display: isShowingFilter ? "flex" : "none", flexDirection: "column", alignItems: "center", marginTop: "5px"}}>
                <label htmlFor="notification-filter">Filter by status: </label>
                <RadioGroup
                    row
                    id="notification-filter"
                    defaultValue="unread"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as "read" | "unread" | "all")}>
                    <FormControlLabel
                        value="read"
                        control={<Radio />}
                        label="Read"
                    />
                    <FormControlLabel
                        value="unread"
                        control={<Radio />}
                        label="Unread"
                    />
                    <FormControlLabel
                        value="all"
                        control={<Radio />}
                        label="All"
                    />
                </RadioGroup>
                <label htmlFor="notification-order" style={{paddingRight: "10px"}}>Order by time: </label>
                <RadioGroup
                    row
                    id="notification-order"
                    defaultValue="desc"
                    onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
                    value={order}>
                    <FormControlLabel
                        value="asc"
                        control={<Radio />}
                        label="Ascending"
                    />
                    <FormControlLabel
                        value="desc"
                        control={<Radio />}
                        label="Descending"
                    />
                </RadioGroup>
            </div>
            {
                notifications.map((e) => (
                    <div className="notification" key={e.id}>
                        <div>
                            <IconButton title={e.read ? "Mark notification as unread" : "Mark notification as read"} onClick={async () => {
                                if (e.read) {
                                    await updateDoc(doc(firestore, `notifications/${e.id}`), {
                                        readBy: arrayRemove(doc(firestore, `users/${props.state.user?.uid}`)),
                                    });
                                } else {
                                    await updateDoc(doc(firestore, `notifications/${e.id}`), {
                                        readBy: arrayUnion(doc(firestore, `users/${props.state.user?.uid}`)),
                                    });
                                }
                            }}>
                                {
                                    e.read ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />
                                }
                            </IconButton>
                        </div>
                        <div>
                            <h1>{e.title}</h1>
                            <p>{e.body}</p>
                        </div>
                        <div>
                            <p>{formatDate(e.time)}</p>
                        </div>
                    </div>
                ))
            }
            <p style={{display: notifications.length !== 0 ? "none" : "flex"}}>No notifications to display</p>
        </div>
    );
}