import "./navbar.css";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Menu from "@mui/icons-material/Menu";
import Clear from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import ToggleIcon from "../toggle-icon/toggle-icon";
import NavbarOption from "./option/navbar-option";
import { AppState } from "../redux/state";
import { auth } from "../firebase/firebase";

interface NavbarProps {
  state: AppState;
  logOut: () => {};
}

export default function Navbar(props: NavbarProps) {
  const [menuOn, setMenuOn] = useState(false);
  const [index, setIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWindowWidth(window.innerWidth);
    });
  }, []);

  function toggleMenuOn() {
    setMenuOn(!menuOn);
  }

  return (
    <div id="page">
      <div id="navbar-outer">
        <div id="navbar-content">
          <img src="/assets/logo.svg" alt="" />
          <h2 style={{ fontSize: windowWidth < 500 ? "1em" : "1.5em" }}>
            Employee Management
          </h2>
          {location.pathname !== "/" ? (
            <IconButton
              title={!menuOn ? "Show menu" : "Hide menu"}
              onClick={toggleMenuOn}
              style={{ color: "white" }}
            >
              <ToggleIcon on={!menuOn} onIcon={<Menu />} offIcon={<Clear />} />
            </IconButton>
          ) : (
            <div></div>
          )}
        </div>
        {menuOn && location.pathname !== "/" ? (
          <div id="navbar-menu">
            <NavbarOption
              onClick={() => {
                setIndex(1);
                setMenuOn(false);
                navigate("/home");
              }}
              title="Home"
              selected={index === 1}
            />
            <NavbarOption
              onClick={() => {
                setIndex(2);
                setMenuOn(false);
                navigate("/profile");
              }}
              title="Profile"
              selected={index === 2}
            />
            <NavbarOption
              onClick={() => {
                setIndex(3);
                setMenuOn(false);
                navigate("/notifications");
              }}
              title="Notifications"
              selected={index === 3}
            />
            <NavbarOption
              onClick={() => {
                setIndex(4);
                setMenuOn(false);
                navigate("/chat");
              }}
              title="Chat with others"
              selected={index === 4}
            />
            {props.state.user?.isAdmin ?? false ? (
              <NavbarOption
                onClick={() => {
                  setIndex(5);
                  setMenuOn(false);
                  navigate("/report-page");
                }}
                title="Report Page"
                selected={index === 5}
              />
            ) : (
              <></>
            )}
            {props.state.user !== null ? (
              <NavbarOption
                onClick={async () => {
                  setIndex(6);
                  setMenuOn(false);
                  props.logOut();
                  await auth.signOut();
                  navigate("/");
                }}
                title="Log out"
                selected={false}
              />
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
      <Outlet />
    </div>
  );
}
