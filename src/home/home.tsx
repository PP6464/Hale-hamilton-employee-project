import "./home.css";
import { auth, firestore } from "../firebase/firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppState } from "../redux/state";
import { collection, onSnapshot, query, where } from "firebase/firestore";

interface HomeProps {
  state: AppState;
}

interface Employee {
  name: string;
  photoURL: string;
  email: string;
  uid: string;
}

interface Filter {
  type: string;
  value: string;
}

export default function Home(props: HomeProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchFilter, setSearchFilter] = useState<Filter>({
    type: "email",
    value: "",
  });
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

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, []);
  useEffect(() => {
    if (props.state.user?.isAdmin ?? false) {
      setLoading(true);
      onSnapshot(
        query(collection(firestore, "users"), where("isAdmin", "==", false)),
        (snapshot) => {
          setEmployees(
            snapshot.docs.map((e) => {
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
    }
  }, []);

  return !loading ? (
    props.state.user?.isAdmin ?? false ? (
      <div className="container">
        <h1 style={{ margin: "10px" }}>Employees</h1>
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
            Filter by:{" "}
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
            <div className="employee-card" key={e.uid}>
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
      <div></div>
    )
  ) : (
    <p>Loading...</p>
  );
}
