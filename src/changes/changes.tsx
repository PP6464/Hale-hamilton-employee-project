import "./changes.css";
import { AppState } from "../redux/state";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase/firebase";
import { onSnapshot, query, collection, orderBy, DocumentSnapshot, getDoc } from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

interface ChangesProps {
  state: AppState;
}

interface Change {
  type: string;
  oldTime?: string;
  oldDate?: string;
  shiftDate: string;
  shiftTime: string;
  timestamp: Date;
  administrator: DocumentSnapshot;
  employee: DocumentSnapshot;
  id: string;
}

export default function Changes(props: ChangesProps) {
  const navigate = useNavigate();
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<"asc"|"desc">("desc");
  const [dates, setDates] = useState<Dayjs[]>([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [showingFilters, setShowingFilters] = useState(false);
  const [selectedChange, setSelectedChange] = useState<Change|null>(null);

  useEffect(() => {
    setLoading(true);
    onSnapshot(
      query(collection(firestore, "changes"), orderBy("timestamp", order)),
      async (snapshot) => {
        let changesLoaded: Change[] = [];
        for (let change of snapshot.docs) {
          const administratorData = await getDoc(change.data()['administrator']);
          const employeeData = await getDoc(change.data()['employee']);
        }
        changesLoaded = changesLoaded.filter(async (e) => {
          if (dates.length === 0) return true;
          return dates.map((f) => f.format("YYYY-MM-DD")).includes((await e).timestamp.toISOString().slice(0, 10));
        });
        setChanges(changesLoaded);
        setLoading(false);
      },
    );
  }, [order, dates]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/?route=/changes");
    } else if (!props.state.user!.isAdmin) {
      navigate("/home");
    }
  }, [navigate, props.state.user]);

  return props.state.user?.isAdmin ?? false ? loading ? (
    <p>Loading...</p>
  ) : selectedChange === null ? (
    <div className="container">
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "5px"}}>
        <h1>Changes</h1>
        <IconButton style={{marginLeft: "10px"}} title={showingFilters ? "Hide filters" : "Show filters"} onClick={() => {
          setShowingFilters(!showingFilters);
        }}>
          {showingFilters ? <FilterAltOffIcon/> : <FilterAltIcon/>}
        </IconButton>
      </div>
      <div style={{
        display: showingFilters ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{marginBottom: "5px"}}>Search on dates:</p>
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
            >
            <DatePicker
              label="Date"
              value={currentDate}
              onChange={(d) => {
              if (d) setCurrentDate(d);
            }}
            />
          </LocalizationProvider>
          <IconButton title="Add this date to search" style={{marginLeft: "5px"}} onClick={() => {
            if (!dates.includes(currentDate)) {
              setDates(dates.concat(currentDate));
            }
          }}>
            <AddIcon/>
          </IconButton>
        </div>
        <p style={{marginTop: "5px"}}>{dates.length === 0 ? "No dates to search for selected" : "Dates filtered for:"}</p>
        {
          dates.map((e) => (
            <div key={e.toString()} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
              <p>{e.format("DD/MM/YYYY")}</p>
              <IconButton title="Remove this date" onClick={() => {
                setDates(dates.filter((f) => {
                  return f !== e;
                }));
              }}>
                <RemoveIcon/>
              </IconButton>
            </div>
            ))
        }
        <p style={{marginTop: "5px"}}>Order by time: </p>
        <RadioGroup
          row
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}>
          <FormControlLabel control={<Radio/>} value="asc" label="Ascending"/>
          <FormControlLabel control={<Radio/>} value="desc" label="Descending"/>
        </RadioGroup>
      </div>
      <p style={{margin: "5px 0", display: changes.length === 0 ? "block" : "none"}}>No changes to display</p>
      {
        changes.map((e) => (
          <div className="change" onClick={() => setSelectedChange(e)}>
            <div>
              <h1>{e.type === "PUT" ? "Shift addition" : e.type === "PATCH" ? "Shift reschedule" : "Shift deletion"}</h1>
              <p>Administrator: {e.administrator.data()!['name']}</p>
              <p>Employee: {e.employee.data()!['name']}</p>
            </div>
            <div>{`${e.timestamp.toISOString().split("T")[1].split(".")[0]} ${e.timestamp.toISOString().slice(0, 10).split("-").reverse().join("/")}`}</div>
          </div>
        ))
      }
    </div>
  ) : (
    <div className="container" style={{position: "relative"}}>
      <IconButton onClick={() => setSelectedChange(null)} title="Go back to all changes" style={{position: "absolute", right: "10px", top: "10px"}}>
        <ClearIcon/>
      </IconButton>
      <h1 style={{padding: "5px"}}>{selectedChange!.type === "PUT" ? "Shift addition" : selectedChange!.type === "PATCH" ? "Shift reschedule" : "Shift deletion"}</h1>
      {
        selectedChange!.type === "PATCH" ? <p>Old shift time: {selectedChange!.oldTime!.substring(0,1).toUpperCase()}{selectedChange!.oldTime!.substring(1)}, {selectedChange!.oldDate!.split("-").reverse().join("/")}</p> : <></>
      }
      {
        <p>{selectedChange!.type === "PATCH" ? "New " : ""}Shift time: {selectedChange!.shiftTime!.substring(0,1).toUpperCase()}{selectedChange!.shiftTime!.substring(1)}, {selectedChange!.shiftDate!.split("-").reverse().join("/")}</p>
      }
      <p>Administrator: {selectedChange!.administrator.data()!['name']}</p>
      <p>Employee: {selectedChange!.employee.data()!['name']}</p>
    </div>
  ) : (
    <div>
      <p>This page is only available to administrators.</p>
    </div>
  );
}
