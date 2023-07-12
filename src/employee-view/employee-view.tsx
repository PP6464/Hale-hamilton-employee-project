import "./employee-view.css";
import { useEffect, useState } from "react";
import { firestore, apiURL, auth } from "../firebase/firebase";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Employee } from "../home/home";
import dayjs from "dayjs";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ReactModal from "react-modal";
import "dayjs/locale/en-gb";

interface EmployeeViewProps {
  employee: Employee;
  onClose: () => void;
}

export interface Shift {
  time: "morning" | "evening";
  date: string;
  id: string;
}

export default function EmployeeView(props: EmployeeViewProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [date, setDate] = useState(dayjs());
  const [time, setTime] = useState<"morning" | "evening">("morning");
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [isReschedulingShift, setIsReschedulingShift] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(dayjs());
  const [rescheduleTime, setRescheduleTime] = useState<"morning" | "evening">(
    "morning"
  );
  const [rescheduleShiftId, setRescheduleShiftId] = useState<string | null>(
    null
  );

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
        <div id="employee-add-shift-details">
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              label="Shift date"
              value={date}
              onChange={(d) => {
                if (d) setDate(d);
              }}
            />
          </LocalizationProvider>
          <label htmlFor="employee-shift-add-time">Time: </label>
          <RadioGroup
            row
            id="employee-shift-add-time"
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
              await fetch(`${apiURL}shift/add?admin=${auth.currentUser!.uid}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  employee: props.employee.uid,
                  time: time,
                  date: date.format("YYYY-MM-DD"),
                }),
              });
              setIsAddingShift(false);
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
      <ReactModal
        ariaHideApp={false}
        id="employee-reschedule-shift-modal"
        isOpen={isReschedulingShift}
        onRequestClose={() => {
          setRescheduleShiftId(null);
          setRescheduleDate(dayjs());
          setRescheduleTime("morning");
          setIsReschedulingShift(false);
        }}
        contentLabel="Reschedule Shift"
      >
        <div id="employee-reschedule-shift-details">
          <h1>Reschedule Shift</h1>
          <p style={{ marginBottom: "10px" }}>
            (Click outside to discard changes)
          </p>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              label="Shift date"
              value={rescheduleDate}
              onChange={(d) => {
                if (d) setRescheduleDate(d);
              }}
            />
          </LocalizationProvider>
          <label htmlFor="employee-shift-reschedule-time">Time: </label>
          <RadioGroup
            row
            id="employee-shift-reschedule-time"
            defaultValue="morning"
            value={rescheduleTime}
            onChange={(e) => {
              setRescheduleTime(e.target.value as "morning" | "evening");
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
            id="employee-shift-reschedule-submit"
            onClick={async () => {
              await fetch(
                `${apiURL}shift/update/${rescheduleShiftId}?admin=${
                  auth.currentUser!.uid
                }`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    employee: props.employee.uid,
                    time: rescheduleTime,
                    date: rescheduleDate.format("YYYY-MM-DD"),
                  }),
                }
              );
              setIsReschedulingShift(false);
            }}
          >
            <EditIcon />
            <p style={{ marginLeft: "5px" }}>Reschedule this shift</p>
          </div>
        </div>
      </ReactModal>
      {shifts.map((e) => (
        <div className="shift" key={e.id}>
          <div>
            <h1>{e.date.split("-").reverse().join("/")}</h1>
            <p>{e.time.substring(0, 1).toUpperCase() + e.time.substring(1)}</p>
          </div>
          <div>
            <IconButton
              title="Reschedule shift"
              onClick={() => {
                setRescheduleShiftId(e.id);
                setRescheduleDate(dayjs(e.date));
                setRescheduleTime(e.time);
                setIsReschedulingShift(true);
              }}
            >
              <EditIcon />
            </IconButton>
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
        </div>
      ))}
    </div>
  );
}
