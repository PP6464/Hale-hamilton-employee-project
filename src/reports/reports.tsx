import './reports.css';
import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { firestore, auth } from "../firebase/firebase";
import { AppState, User } from "../redux/state";
import { useNavigate } from "react-router-dom";

interface ReportsProps {
    state: AppState;
}

interface Shift {
    time: string;
    date: string;
    id: string;
    employee: string;
}

export default function Reports(props: ReportsProps) {
    const [weeks, setWeeks] = useState<string[]>([]);
    const [dates, setDates] = useState<Date[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (auth.currentUser === null) {
            navigate("/?route=/reports");
        } else if (!(props.state.user?.isAdmin ?? false)) {
            navigate("/home");
        }
    }, [props.state.user?.isAdmin, navigate]);
    useEffect(() => {
        setLoading(true);
        onSnapshot(
            query(collection(firestore, "shifts")),
            (snapshot) => {
                setShifts(snapshot.docs.map((e) => {
                    if (!dates.map((e) => e.toISOString().slice(0, 10)).includes(e.data()['date'])) setDates(dates.concat());
                    return {
                        ...(e.data() as any),
                        employee: e.data()['employee'].id,
                        id: e.id,
                    };
                }));
                setLoading(false);
            },
        );
        onSnapshot(
            query(collection(firestore, "users"), where("department", "==", props.state.user?.department)),
            (snapshot) => {
                setEmployees(snapshot.docs.filter((e) => e.id !== auth.currentUser!.uid && !e.data()['isAdmin']).map((e) => {
                    return {
                      ...(e.data() as any),
                        uid: e.id,
                    };
                }))
                setLoading(false);
            }
        );
    }, [dates, props.state.user?.department]);
    useEffect(() => {
        const datesSorted = dates.sort((a, b) => a.valueOf() - b.valueOf());            
        const start = datesSorted[0];
        const end = datesSorted[datesSorted.length - 1];
        let currentWeekStart = new Date(start);
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
        while (currentWeekStart <= end) {
            const currentWeekEnd = new Date(currentWeekStart.getDate() + 6);
            setWeeks(weeks.concat(`${currentWeekStart.toISOString().slice(0, 10).split("-").reverse().join("/")} - ${currentWeekEnd.toISOString().slice(0, 10).split("-").reverse().join("/")}`));
            currentWeekStart.setDate(currentWeekEnd.getDate() + 1);
        }
    }, [dates, weeks]);
    
    return loading ? (
        <div className="container">
            <p>Loading...</p>
        </div>
    ) : (
        <div className="container">
            <h1>Reports page</h1>
            {
                weeks.map((e) => (
                    <div key={e} className="week">
                        <h1>{e}</h1>
                    </div>
                ))
            }
        </div>
    );
}