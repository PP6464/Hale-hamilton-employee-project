import "./changes.css";
import { AppState } from "../redux/state";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase/firebase";
import { onSnapshot, query, collection, orderBy } from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
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
  administrator: string;
  employee: string;
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
  const [selectedChange, setSelectedChange] = useState<Change|null>();

  useEffect(() => {
    setLoading(true);
    onSnapshot(
      query(collection(firestore, "changes"), orderBy("timestamp", order)),
      (snapshot) => {
        setChanges(snapshot.docs.map((e) => {
          return {
            ...(e.data() as any),
            timestamp: e.data()['timestamp'].toDate(),
            id: e.id,
          }
        }).filter((e) => {
          if (dates.length === 0) return true;
          return dates.map((f) => f.format("YYYY-MM-DD")).includes(e.timestamp.toISOString().slice(0, 10));
        }));
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
  ) : (
    <div className="container">
      <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
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
        <p style={{margin: "5px 0"}}>Search on dates:</p>
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
        <p style={{margin: "5px 0", display: dates.length === 0 ? "block" : "none"}}>No dates to search for selected</p>
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
          <div className="report">
            <p>{e.type}</p>
          </div>
        ))
      }
    </div>
  ) : (
    <div>
      <p>This page is only available to administrators.</p>
    </div>
  );
}
