import "./reports.css";
import { AppState } from "../redux/state";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

interface ReportsProps {
  state: AppState;
}

export default function Reports(props: ReportsProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    } else if (!props.state.user!.isAdmin) {
      navigate("/home");
    }
  }, [navigate, props.state.user]);

  return props.state.user?.isAdmin ?? false ? (
    <div>
      <h1>Reports</h1>
    </div>
  ) : (
    <div>
      <p>This page is only available to administrators.</p>
    </div>
  );
}
