import "./home.css";
import EmployeeView from "../employee-view/employee-view";
import { apiURL, auth, firestore } from "../firebase/firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppState } from "../redux/state";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { Shift } from "../employee-view/employee-view";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import dayjs, { Dayjs } from "dayjs";
import ReactModal from "react-modal";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/en-gb";
import AddIcon from "@mui/icons-material/Add";

interface HomeProps {
  state: AppState;
}

export interface Employee {
  name: string;
  photoURL: string;
  email: string;
  uid: string;
}

interface Filter {
  type: "email" | "name";
  value: string;
}

export default function Home(props: HomeProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchFilter, setSearchFilter] = useState<Filter>({
    type: "email",
    value: "",
  });
  const [isReschedulingShift, setIsReschedulingShift] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(dayjs());
  const [rescheduleTime, setRescheduleTime] = useState<"morning" | "evening">(
    "morning"
    );
  const [rescheduleShiftId, setRescheduleShiftId] = useState<string | null>(
    null
    );
  const [date, setDate] = useState(dayjs());
  const [time, setTime] = useState<"morning" | "evening">("morning");
  const [isAddingShift, setIsAddingShift] = useState(false);
  const filteredEmployees = () => {
    return employees.filter((e) => {
      switch (searchFilter.type) {
        case "email":
          return e.email
            .toLowerCase()
            .includes(searchFilter.value.toLowerCase());
        case "name":
          return e.name
            .toLowerCase()
            .includes(searchFilter.value.toLowerCase());
        default:
          return true;
      }
    });
  };
  const [shifts, setShifts] = useState<Shift[]>([]);
  function normalise(a: number) {
    return a / Math.abs(a);
  }

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, [navigate]);
  useEffect(() => {
    if (props.state.user?.isAdmin ?? false) {
      setLoading(true);
      onSnapshot(
        query(collection(firestore, "users"), where("department", "==", props.state.user?.department)),
        (snapshot) => {
          setEmployees(
            snapshot.docs.filter((e) => !e.data()!['isAdmin']).map((e) => {
              return {
                email: e.data()["email"],
                name: e.data()["name"],
                photoURL: e.data()["photoURL"],
                uid: e.id,
              };
            })
          );
          setLoading(false);
        }
      );
    } else if (auth.currentUser) {
      setLoading(true);
      onSnapshot(
        query(collection(firestore, "shifts"), where("employee", "==", doc(firestore, `users/${auth.currentUser!.uid}`))),
        (snapshot) => {
          setShifts(
            snapshot.docs.map((e) => {
              return {
                time: e.data()['time'],
                date: e.data()['date'],
                id: e.id,
              }
            }).sort((a, b) => {
              if (new Date(a.date).valueOf() - new Date(b.date).valueOf() !== 0)
                return normalise(
                  new Date(a.date).valueOf() - new Date(b.date).valueOf()
                  );
              else if (a.time === "morning" && b.time === "evening") return 1;
              else return -1;
            })
          );
          setLoading(false);
        },
      );
    }
  }, [props.state.user?.isAdmin, props.state.user?.department]);

  function shouldDisableDate(date: Dayjs, mode: "add" | "update" = "add") {
    if (!(props.state.user?.isAdmin ?? false)) {
      return shifts
        .filter((e) => {
          return !(e.id === rescheduleShiftId && mode === "update");
        })
        .map((e) => e.date)
        .includes(date.format("YYYY-MM-DD"));
    } else return false;
  }

  return !loading ? (
    props.state.user?.isAdmin ?? false ? (
      selectedEmployee === null ? (
        <div className="container">
          <h1 style={{ margin: "10px" }}>Employees in {props.state.user?.department}</h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <input
              id="employee-search-filter-value"
              value={searchFilter.value}
              placeholder={(() => {
                switch (searchFilter.type) {
                  case "email":
                    return "Search by email";
                  case "name":
                    return "Search by name";
                }
              }).call(null)}
              onChange={(e) => {
                setSearchFilter({
                  ...searchFilter,
                  value: e.target.value,
                });
              }}
            />
            <label htmlFor="filter-select" style={{ margin: "0 10px" }}>
              Filter by:
            </label>
            <select
              id="filter-select"
              onChange={(e) => {
                setSearchFilter({
                  ...searchFilter,
                  type: e.target.selectedIndex === 0 ? "name" : "email",
                });
              }}
            >
              <option value="name">Name</option>
              <option value="name">Email</option>
            </select>
          </div>
          {filteredEmployees().length > 0 ? (
            filteredEmployees().map((e) => (
              <div
                className="employee-card"
                key={e.uid}
                onClick={() => {
                  setSelectedEmployee(e);
                }}
              >
                <img src={e.photoURL} alt="" />
                <div>
                  <h2>{e.name}</h2>
                  <p>{e.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ marginTop: "5px" }}>No employees to display</p>
          )}
        </div>
      ) : (
        <EmployeeView
          employee={selectedEmployee}
          onClose={() => {
            setSelectedEmployee(null);
          }}
        />
      )
    ) : auth.currentUser ? (
      <div>
        <div id="employee-view-header">
          <img src={auth.currentUser!.photoURL!} alt="" />
          <div>
            <h1>{auth.currentUser!.displayName}</h1>
            <p>{auth.currentUser!.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", marginBottom: "10px", alignItems: "center", justifyContent: "center" }}>
          <div id="employee-shift-add" onClick={() => setIsAddingShift(!isAddingShift)}>
            <AddIcon />
            <p>Request to add a shift</p>
          </div>
        </div>
        {isAddingShift ? (
          <div id="employee-add-shift-details">
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="en-gb"
              >
              <DatePicker
                disablePast
                label="Shift date"
                shouldDisableDate={(date: Dayjs) => shouldDisableDate(date, "add")}
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
              await fetch(`${apiURL}shift/request/add`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  employee: auth.currentUser!.uid,
                  time: time,
                  date: date.format("YYYY-MM-DD"),
                }),
              });
              setIsAddingShift(false);
            }}
              >
              <AddIcon />
              <p>Request to add shift</p>
            </div>
          </div>
          ) : (
            <></>
            )}
        <p style={{display: shifts.length === 0 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center'}}>No shifts to display</p>
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
                disablePast
                label="Shift date"
                value={rescheduleDate}
                shouldDisableDate={(date: Dayjs) => shouldDisableDate(date, "update")}
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
                `${apiURL}shift/request/update/${rescheduleShiftId}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    employee: auth.currentUser!.uid,
                    time: rescheduleTime,
                    date: rescheduleDate.format("YYYY-MM-DD"),
                  }),
                }
                );
              setIsReschedulingShift(false);
            }}
              >
              <EditIcon />
              <p style={{ marginLeft: "5px" }}>Request to reschedule</p>
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
                title="Request to reschedule shift"
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
                  `${apiURL}shift/request/delete/${e.id}?by=${auth.currentUser!.uid}`,
                  {
                    method: "POST",
                  }
                  );
              }}
                title="Request to delete this shift"
                >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
          ))}
      </div>
    ) : (
      <p>Redirecting to login...</p>
    )
  ) : (
    <p>Loading...</p>
  );
}
