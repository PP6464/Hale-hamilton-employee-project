import "./chat.css";
import {AppState} from "../redux/state";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {auth, firestore, apiURL} from "../firebase/firebase";
import {User} from "../redux/state";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import ReactModal from "react-modal";
import {onSnapshot, query, where, collection, DocumentReference, doc, documentId} from "firebase/firestore";

interface ChatProps {
    state: AppState;
}

interface Filter {
    type: "name" | "email";
    value: string;
}

interface Group {
    name: string;
    desc: string;
    users: string[];
    id: string;
}

interface NewGroupDetails {
    name: string;
    desc: string;
}

export default function ChatWithOthers(props: ChatProps) {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [filter, setFilter] = useState<Filter>({type: "name", value: ""});
    const [groupFilter, setGroupFilter] = useState("");
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [newGroup, setNewGroup] = useState<NewGroupDetails>({
        name: "",
        desc: "",
    });

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/?route=/chat-with-others");
        }
    }, [navigate]);
    useEffect(() => {
        onSnapshot(
            query(collection(firestore, "users"), where(documentId(), "!=", auth.currentUser!.uid)),
            (snapshot) => {
                setUsers(snapshot.docs.filter((e) => e.data()[filter.type].toLowerCase().includes(filter.value.toLowerCase())).map((e) => {
                    return {
                        ...(e.data() as any),
                        uid: e.id,
                    }
                }));
            }
        );
    }, [filter]);
    useEffect(() => {
        onSnapshot(
            query(collection(firestore, "groups"), where("users", "array-contains", doc(firestore, `users/${auth.currentUser!.uid}`))),
            (snapshot) => {
                setGroups(snapshot.docs.filter((e) => e.data()['name'].toLowerCase().includes(groupFilter.toLowerCase())).map((e) => {
                    return {
                        ...(e.data() as any),
                        id: e.id,
                        users: e.data()['users'].map((f: DocumentReference) => f.id)
                    };
                }));
            }
        );
    }, [groupFilter]);
    return (
        <div className="container">
            <h1>Chat with others</h1>
            <h3>One to One</h3>
            <div id="one-to-one-search">
                <input placeholder={filter.type === "name" ? "Search by name" : "Search by email"} value={filter.value}
                       onChange={(e) => {
                           setFilter({
                               ...filter,
                               value: e.target.value,
                           });
                       }}/>
                <label htmlFor="chat-filter-one-to-one">Filter by:</label>
                <select id="chat-filter-one-to-one" onChange={(e) => {
                    setFilter({...filter, type: e.target.selectedIndex === 0 ? "name" : "email"});
                }}>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                </select>
            </div>
            <p style={{margin: "5px"}}>Administrators</p>
            {
                users.filter((e) => e.isAdmin).map((e) => (
                    <div
                        className="user"
                        key={e.uid}
                        onClick={() => {
                            navigate(`/chat/121/${e.uid}`);
                        }}
                    >
                        <img src={e.photoURL} alt=""/>
                        <div>
                            <h1>{e.name}</h1>
                            <p>{e.email}</p>
                        </div>
                    </div>
                ))
            }
            <p style={{display: users.filter((e) => e.isAdmin).length === 0 ? "block" : "none"}}>No administrators to
                display</p>
            <p style={{margin: "5px"}}>Employees</p>
            {
                users.filter((e) => !e.isAdmin).map((e) => (
                    <div
                        className="user"
                        key={e.uid}
                        onClick={() => {
                            navigate(`/chat/121/${e.uid}`);
                        }}
                    >
                        <img src={e.photoURL} alt=""/>
                        <div>
                            <h1>{e.name}</h1>
                            <p>{e.email}</p>
                        </div>
                    </div>
                ))
            }
            <p style={{display: users.filter((e) => !e.isAdmin).length === 0 ? "block" : "none"}}>No employees to
                display</p>
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                <h3>Groups</h3>
                <IconButton title="Create Group" onClick={() => setCreatingGroup(true)}>
                    <AddIcon/>
                </IconButton>
            </div>
            <ReactModal
                id="create-group-modal"
                isOpen={creatingGroup}
                onRequestClose={() => setCreatingGroup(false)}
                ariaHideApp={false}>
                <div id="create-group-details">
                    <h1 style={{marginBottom: "5px"}}>Create new group</h1>
                    <input
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({
                            ...newGroup,
                            name: e.target.value,
                        })}
                        placeholder="Group name"/>
                    <input
                        value={newGroup.desc}
                        onChange={(e) => setNewGroup({
                            ...newGroup,
                            desc: e.target.value,
                        })}
                        placeholder="Group description"/>
                    <button onClick={async () => {
                        await fetch(
                            `${apiURL}chat/group/new?name=${newGroup.name}&desc=${newGroup.desc}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    members: [auth.currentUser!.uid],
                                }),
                            }
                        );
                        setNewGroup({
                            name: "",
                            desc: "",
                        });
                        setCreatingGroup(false);
                    }}>
                        <AddIcon style={{marginRight: "3px"}}/>
                        Create Group
                    </button>
                </div>
            </ReactModal>
            <div id="group-search">
                <input placeholder="Search groups by name" value={groupFilter} onChange={(e) => {
                    setGroupFilter(e.target.value);
                }}/>
            </div>
            {
                groups.map((e) => (
                    <div
                        className="group"
                        key={e.id}
                        onClick={() => {
                            navigate(`/chat/group/${e.id}`);
                        }}
                    >
                        <h1>{e.name}</h1>
                        <p>{e.desc}</p>
                        <p>{e.users.length} members</p>
                    </div>
                ))
            }
            <p style={{display: groups.length === 0 ? "block" : "none"}}>No groups to display</p>
        </div>
    );
}