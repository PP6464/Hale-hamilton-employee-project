import './121.css';
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {apiURL, auth, firestore} from "../../firebase/firebase";
import {onSnapshot, query, orderBy, collection, doc, DocumentReference} from "firebase/firestore";
import {User} from "../../redux/state";
import SendIcon from "@mui/icons-material/Send";
import IconButton from '@mui/material/IconButton';

interface Message {
    text: string;
    from: DocumentReference;
    to: DocumentReference;
    timestamp: Date;
    id: string;
}

export default function OneToOneChat() {
    const navigate = useNavigate();
    const {uid} = useParams();
    const [userData, setUserData] = useState<User>({
        email: "blank.email@circor.com",
        isAdmin: false,
        name: "Blank name",
        photoURL: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        department: "",
        uid: uid ?? "",
    });
    const [msgText, setMsgText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        onSnapshot(
            doc(firestore, `users/${uid}`),
            (snapshot) => {
                setUserData({
                    ...(snapshot.data() as any),
                    uid: snapshot.id,
                });
            },
        );
        onSnapshot(
            query(collection(firestore, `121/${[auth.currentUser!.uid, uid].sort().join()}/messages`), orderBy('time')),
            (snapshot) => {
                setMessages(
                    snapshot.docs.map((e) => {
                        return {
                            ...(e.data() as any),
                            id: e.id,
                            timestamp: e.data()['time'].toDate(),
                        };
                    })
                );
            },
        );
    }, [uid]);
    useEffect(() => {
        if (auth.currentUser === null) {
            navigate(`/?route=/chat/121/${uid}`)
        }
    }, [navigate, uid]);

    return (
        <div className="container">
            <div id="one-to-one-header">
                <img src={userData.photoURL} alt=""/>
                <div>
                    <h1>{userData.name}</h1>
                    <p>{userData.email}</p>
                </div>
            </div>
            <p style={{display: messages.length !== 0 ? "none" : "block"}}>You have no messages to display</p>
            <div id="one-to-one-messages">
                {
                    messages.map((e) => (
                        <div key={e.id} style={{
                            display: "flex",
                            width: "100vw",
                            alignContent: "center",
                            padding: "0 10px",
                            justifyContent: e.from.id !== uid ? "flex-end" : "flex-start"
                        }}>
                            <div className="message" data-from-user={e.from.id !== uid}>
                                <div>
                                    <img src={e.from.id !== uid ? auth.currentUser!.photoURL! : userData.photoURL}
                                         alt=""/>
                                    <div>
                                        <h3>{e.from.id !== uid ? auth.currentUser!.displayName : userData.name}</h3>
                                        <p>{e.timestamp.toISOString().split("T")[1].split(".")[0] + " " + e.timestamp.toISOString().split("T")[0].split("-").reverse().join("/")}</p>
                                    </div>
                                </div>
                                <p>{e.text}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div id="one-to-one-msg">
                <input placeholder={`Send a message to ${userData.name}`} value={msgText}
                       onChange={(e) => setMsgText(e.target.value)}/>
                <IconButton onClick={async () => {
                    if (msgText === "") {
                        alert("Text required to send message");
                        return;
                    }
                    await fetch(`${apiURL}chat/message`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            from: auth.currentUser!.uid,
                            to: uid,
                            text: msgText,
                        }),
                    });
                    setMsgText("");
                }} title={msgText === "" ? "Message text required to send" : `Send ${msgText} to ${userData.name}`}>
                    <SendIcon/>
                </IconButton>
            </div>
        </div>
    );
}