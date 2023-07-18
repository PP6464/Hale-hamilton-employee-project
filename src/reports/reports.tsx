import './reports.css';
import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { firestore, auth } from "../firebase/firebase";
import { AppState, User } from "../redux/state";
import { useNavigate } from "react-router-dom";
import { IconButton } from '@mui/material';
import ClearIcon from "@mui/icons-material/Clear";

interface ReportsProps {
    state: AppState;
}

interface Shift {
    time: string;
    date: string;
    id: string;
    employee: string;
}

interface Week {
    start: Date;
    end: Date;
}

function generateWeeksFromDateList(dates: Date[]): Week[] {
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    const weeks: Week[] = [];
    let currentWeekStart = new Date(startDate);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

    while (currentWeekStart <= endDate) {
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

        weeks.push({ start: new Date(currentWeekStart), end: new Date(currentWeekEnd) });

        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
}

export default function Reports(props: ReportsProps) {
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [dates, setDates] = useState<Date[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<Week|null>(null);
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
                    setDates(d => d.concat(new Date(e.data()['date'])));
                    return {
                        ...(e.data() as any),
                        employee: e.data()['employee'].id,
                        id: e.id,
                    };
                }));
                setWeeks(generateWeeksFromDateList(dates));
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
        setLoading(false);
    }, [props.state.user?.department, dates]);

    return loading ? (
        <div className="container">
            <p>Loading...</p>
        </div>
    ) : selectedWeek === null ? (
        <div className="container">
            <h1 style={{marginBottom: "5px"}}>Reports</h1>
            {
                weeks.map((e) => (
                    <div key={e.start.toISOString()} className="week" onClick={() => {
                        setSelectedWeek(e);
                    }}>
                        <h1>{e.start.toISOString().slice(0,10).split("-").reverse().join("/")} - {e.end.toISOString().slice(0,10).split("-").reverse().join("/")}</h1>
                    </div>
                ))
            }
        </div>
    ) : (
        <div className='container' style={{position: "relative"}}>
            <h1 style={{margin: "5px 0"}}>{selectedWeek.start.toISOString().slice(0,10).split("-").reverse().join("/")} - {selectedWeek.end.toISOString().slice(0,10).split("-").reverse().join("/")}</h1>
            <IconButton title="Close view" onClick={() => setSelectedWeek(null)} style={{position: "absolute", right: "10px", top: "10px"}}>
                <ClearIcon />
            </IconButton>
            {
                shifts.filter((e) => new Date(e.date) >= selectedWeek.start && new Date(e.date) <= selectedWeek.end).map((e) => (
                    <div className='report-shift' key={e.id}>
                        <div>
                            <h1>Employee {e.employee}</h1>
                            <p>Name: {employees.filter((f) => f.uid = e.employee)[0].name}</p>
                            <p>Email: {employees.filter((f) => f.uid = e.employee)[0].email}</p>
                        </div>
                        <div>
                            <p>{e.time === "morning" ? "Morning (6am - 2pm)" : "Evening (2pm - 10pm)"}</p>
                            <p>{e.date.split("-").reverse().join("/")}</p>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}