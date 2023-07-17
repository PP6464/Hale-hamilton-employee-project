import "./group.css";
import {useEffect, useState} from "react";
import {auth, firestore, apiURL} from "../../firebase/firebase";
import {useNavigate, useParams} from "react-router-dom";
import {
    onSnapshot,
    query,
    orderBy,
    collection,
    doc,
    DocumentSnapshot,
    getDoc,
} from "firebase/firestore";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactModal from "react-modal";
import {User} from "../../redux/state";

interface Group {
    name: string;
    desc: string;
    id: string;
    users: DocumentSnapshot[];
}

interface Message {
    text: string;
    user: string;
    timestamp: Date;
    id: string;
}

interface UserFilter {
    value: string;
    type: "name" | "email"
}

export default function GroupChat() {
    const navigate = useNavigate();
    const {id} = useParams();
    const [group, setGroup] = useState<Group>({
        name: "Blank name",
        desc: "Blank desc",
        users: [],
        id: id!,
    });
    const [userSearchFilter, setUserSearchFilter] = useState<UserFilter>({
        type: "name",
        value: "",
    });
    const [users, setUsers] = useState<User[]>([]);
    const [msgText, setMsgText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isChangingGroup, setIsChangingGroup] = useState(false);
    const [nameText, setNameText] = useState("");
    const [descText, setDescText] = useState("");

    useEffect(() => {
        if (auth.currentUser === null) {
            navigate(`/?route=/chat/group/${id}`)
        }
    }, [navigate, id]);
    useEffect(() => {
        onSnapshot(
            doc(firestore, `groups/${id}`),
            async (snapshot) => {
                if (!snapshot.exists()) {
                    navigate(-1);
                    return;
                }
                const userData = [];
                for (let usr of snapshot.data()!['users']) {
                    userData.push(await getDoc(usr));
                }
                setGroup({
                    ...(snapshot.data()! as any),
                    users: userData,
                    id: snapshot.id,
                });
            },
        );
        onSnapshot(
            query(collection(firestore, `groups/${id}/messages`), orderBy("time")),
            (snapshot) => {
                setMessages(snapshot.docs.map((e) => {
                    return {
                        ...(e.data()! as any),
                        timestamp: e.data()!['time'].toDate(),
                        user: e.data()!['user'].id,
                        id: e.id,
                    };
                }));
            },
        );
        onSnapshot(
            query(collection(firestore, 'users')),
            (snapshot) => {
                setUsers(snapshot.docs.map((e) => {
                    return {
                        ...(e.data() as any),
                        uid: e.id,
                    };
                }));
            },
        );
    }, [id, navigate]);

    return (
        <div className="container">
            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <div id="one-to-one-header">
                    <div>
                        <h1>{group.name}</h1>
                        <p>{group.desc}</p>
                    </div>
                </div>
                <IconButton onClick={() => {
                    setNameText(group.name);
                    setDescText(group.desc);
                    setIsChangingGroup(true);
                }} title="Edit group details">
                    <EditIcon/>
                </IconButton>
                <IconButton title="Delete group" onClick={async () => {
                    await fetch(`${apiURL}chat/group/${id}?by=${auth.currentUser!.uid}`, {
                        method: 'DELETE',
                    });
                    navigate(-1);
                }}>
                    <DeleteIcon/>
                </IconButton>
            </div>
            <ReactModal
                id="group-change-modal"
                isOpen={isChangingGroup}
                ariaHideApp={false}
                onRequestClose={() => {
                setIsChangingGroup(false);
                setNameText(group.name);
                setDescText(group.desc);
            }}>
                <div id="group-change-content">
                    <h1>Change group details</h1>
                    <p>(Click outside to discard changes)</p>
                    <input value={nameText} onChange={(e) => setNameText(e.target.value)} placeholder="New group name"/>
                    <input value={descText} onChange={(e) => setDescText(e.target.value)} placeholder="New group description"/>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <input value={userSearchFilter.value} onChange={(e) => setUserSearchFilter({...userSearchFilter, value: e.target.value})} placeholder={`Search by ${userSearchFilter.type}`}/>
                        <p style={{margin: "0 10px"}}>Filter by:</p>
                        <select value={userSearchFilter.type} onChange={(e) => setUserSearchFilter({
                            ...userSearchFilter,
                            type: e.target.selectedIndex === 0 ? "name" : "email"
                        })}>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                        </select>
                    </div>
                    <h3>Users:</h3>
                    {
                        users.filter((e) => e[userSearchFilter.type].includes(userSearchFilter.value) && e.uid !== auth.currentUser!.uid).map((e) => (
                            <div key={e.uid} style={{display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 10px"}}>
                                <div>
                                    <h1>{e.name}</h1>
                                    <p>{e.email}</p>
                                </div>
                                <IconButton
                                    title={group.users.map((f) => f.id).includes(e.uid) ? "Remove user" : "Add user"}
                                    onClick={async () => {
                                        await fetch(`${apiURL}chat/group/${group.id}/change?type=${group.users.map((f) => f.id).includes(e.uid) ? "remove" : "add"}&user=${e.uid}&by=${auth.currentUser!.uid}`, {
                                            method: "PATCH",
                                        });
                                    }}>
                                    {group.users.map((f) => f.id).includes(e.uid) ? <RemoveIcon/> : <AddIcon/>}
                                </IconButton>
                            </div>
                        ))
                    }
                    <button onClick={async () => {
                        await fetch(`${apiURL}chat/group/${group.id}/edit?by=${auth.currentUser!.uid}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                name: nameText,
                                desc: descText,
                            }),
                        });
                        setIsChangingGroup(false);
                    }}>Save changes</button>
                </div>
            </ReactModal>
            <p style={{display: messages.length !== 0 ? "none" : "block"}}>You have no messages to display</p>
            {
                messages.map((e) => {
                    return (
                        <div key={e.id} style={{
                            display: "flex",
                            width: "100vw",
                            alignContent: "center",
                            padding: "0 10px",
                            justifyContent: e.user === auth.currentUser!.uid ? "flex-end" : "flex-start"
                        }}>
                            <div className="message" data-from-user={e.user === auth.currentUser!.uid}>
                                <div>
                                    <img src={users.filter((f) => f.uid === e.user)[0].photoURL} alt=""/>
                                    <div>
                                        <h3>{users.filter((f) => f.uid === e.user)[0].name}</h3>
                                        <p>{e.timestamp.toISOString().split("T")[1].split(".")[0] + " " + e.timestamp.toISOString().split("T")[0].split("-").reverse().join("/")}</p>
                                    </div>
                                </div>
                                <p>{e.text}</p>
                            </div>
                        </div>
                )})
            }
            <div id="one-to-one-msg">
                <input placeholder={`Send a message in ${group.name}`} value={msgText}
                       onChange={(e) => setMsgText(e.target.value)}/>
                <IconButton onClick={async () => {
                    if (msgText === "") {
                        alert("Text required to send message");
                        return;
                    }
                    await fetch(`${apiURL}chat/group/${id}/message?uid=${auth.currentUser!.uid}&text=${msgText}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    setMsgText("");
                }} title={msgText === "" ? "Message text required to send" : `Send ${msgText} in ${group.name}`}>
                    <SendIcon/>
                </IconButton>
            </div>
        </div>
    );
}