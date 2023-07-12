import "./no-page.css";
import { Link } from "react-router-dom";
import { AppState } from "../redux/state";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

interface NoPageProps {
  state: AppState;
}

export default function NoPage(props: NoPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div id="no-page-container">
      <h1>404</h1>
      <p>This route is not valid. Please try visiting one of: </p>
      {props.state.user !== null ? (
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/chat-with-others">Chat with others</Link>
          </li>
          <li>
            <Link to="/notifications">Notifications</Link>
          </li>
          {props.state.user.isAdmin ? (
            <li>
              <Link to="/reports">Reports</Link>
            </li>
          ) : (
            <></>
          )}
        </ul>
      ) : (
        <p>Redirecting you to login page ...</p>
      )}
    </div>
  );
}
