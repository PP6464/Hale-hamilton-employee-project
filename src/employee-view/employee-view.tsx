import "./employee-view.css";
import { useEffect, useState } from "react";
import { firestore, apiURL, auth } from "../firebase/firebase";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Employee } from "../home/home";
import dayjs from "dayjs";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

interface EmployeeViewProps {
  employee: Employee;
  onClose: () => void;
}

interface Shift {
  time: "morning" | "evening";
  date: string;
  id: string;
}

export default function EmployeeView(props: EmployeeViewProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [date, setDate] = useState(dayjs());
  const [time, setTime] = useState<"morning" | "evening">("morning");
  const [isAddingShift, setIsAddingShift] = useState(false);

  function normalise(a: number) {
    return a / Math.abs(a);
  }

  function toggleAddingShift() {
    setIsAddingShift(!isAddingShift);
  }

  useEffect(() => {
    onSnapshot(
      query(
        collection(firestore, `shifts`),
        where("employee", "==", doc(firestore, `users/${props.employee.uid}`))
      ),
      (snapshot) => {
        setShifts(
          snapshot.docs
            .map((e) => {
              return {
                date: e.data()["date"],
                time: e.data()["time"],
                id: e.id,
              };
            })
            .sort((a, b) => {
              if (new Date(a.date).valueOf() - new Date(b.date).valueOf() !== 0)
                return normalise(
                  new Date(a.date).valueOf() - new Date(b.date).valueOf()
                );
              else if (a.time === "morning" && b.time === "evening") return 1;
              else return -1;
            })
        );
      }
    );
  }, [props.employee.uid]);

  return (
    <div className="container">
      <div id="employee-view-header">
        <img src={props.employee.photoURL} alt="" />
        <div>
          <h1>{props.employee.name}</h1>
          <p>{props.employee.email}</p>
        </div>
        <IconButton
          title="Close employee view"
          onClick={props.onClose}
          style={{ position: "absolute", right: "10px" }}
        >
          <ClearIcon />
        </IconButton>
      </div>
      <div id="employee-shift-add" onClick={toggleAddingShift}>
        <AddIcon />
        <p>Add a shift</p>
      </div>
      {isAddingShift ? (
        <div>
          <DatePicker
            label="Shift date"
            value={date}
            onChange={(d) => {
              if (d) setDate(d);
            }}
          />
          <label htmlFor="employee-shift-add-time">Time: </label>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="morning"
            value={time}
            onChange={(e) => {
              setTime(e.target.value as "morning" | "evening");
            }}
          >
            <FormControlLabel
              value="morning"
              control={<Radio />}
              label="Morning"
            />
            <FormControlLabel
              value="evening"
              control={<Radio />}
              label="Evening"
            />
          </RadioGroup>
          <div
            id="employee-shift-add-submit"
            onClick={async () => {
              await fetch(
                `${apiURL}shifts/add?admin=${auth.currentUser!.uid}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    employee: props.employee.uid,
                    time: time,
                    date: date,
                  }),
                }
              );
            }}
          >
            <AddIcon />
            <p>Add this shift</p>
          </div>
        </div>
      ) : (
        <></>
      )}
      <p
        style={{
          display: shifts.length > 0 ? "none" : "block",
          marginTop: "10px",
        }}
      >
        There are no shifts to display
      </p>
      {shifts.map((e) => (
        <div className="shift" key={e.id}>
          <div>
            <h1>{e.date.split("-").reverse().join("/")}</h1>
            <p>{e.time.substring(0, 1).toUpperCase() + e.time.substring(1)}</p>
          </div>
          <IconButton
            onClick={async () => {
              await fetch(
                apiURL +
                  "shift/delete/" +
                  e.id +
                  "?admin=" +
                  auth.currentUser?.uid,
                {
                  method: "DELETE",
                }
              );
            }}
            title="Delete this shift"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
