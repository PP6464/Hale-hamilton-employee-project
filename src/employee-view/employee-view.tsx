import "./employee-view.css";
import { useEffect, useState } from "react";
import { firestore } from "../firebase/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { Employee } from "../home/home";

interface EmployeeViewProps {
  employee: Employee;
  onClose: () => void;
}

interface Shift {
  time: "morning" | "evening";
  date: string;
}

export default function EmployeeView(props: EmployeeViewProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);

  function normalise(a: number) {
    return a / Math.abs(a);
  }

  useEffect(() => {
    onSnapshot(
      query(collection(firestore, `users/${props.employee.uid}/shifts`)),
      (snapshot) => {
        setShifts(
          snapshot.docs
            .map((e) => {
              return {
                date: e.data()["date"],
                time: e.data()["time"],
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
  }, []);

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
      {shifts.map((e) => (
        <div className="shift">
          <div>
            <h1>{e.date.split("-").reverse().join("/")}</h1>
            <p>{e.time.substring(0, 1).toUpperCase() + e.time.substring(1)}</p>
          </div>
          <IconButton onClick={async () => {
              
          }} title="Delete this shift">
            <DeleteIcon />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
