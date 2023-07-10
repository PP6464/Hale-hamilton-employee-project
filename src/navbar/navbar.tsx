import "./navbar.css";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import Menu from "@mui/icons-material/Menu";
import Clear from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import ToggleIcon from "../toggle-icon/toggle-icon";
import NavbarOption from "./option/navbar-option";
import {AppState} from "../redux/state";

interface NavbarProps {
    state: AppState
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
                    <img src="/assets/logo.svg" alt=""/>
                    <h2 style={{fontSize: windowWidth < 500 ? "1em" : "1.5em"}}>
                        Employee Management
                    </h2>
                    {location.pathname !== "/" ? (
                        <IconButton
                            title={menuOn ? "Show menu" : "Hide menu"}
                            onClick={toggleMenuOn}
                            style={{color: "white"}}
                        >
                            <ToggleIcon on={!menuOn} onIcon={<Menu/>} offIcon={<Clear/>}/>
                        </IconButton>
                    ) : (
                        <div></div>
                    )}
                </div>
                {
                    menuOn ? <div id="navbar-menu">
                        <NavbarOption onClick={() => {
                            setIndex(1);
                            navigate("/home");
                        }} title="Home" selected={index === 1}/>
                        <NavbarOption onClick={() => {
                        }} title="Profile" selected={index === 2}/>
                        <NavbarOption onClick={() => {
                        }} title="Notifications" selected={index === 3}/>
                        <NavbarOption onClick={() => {
                        }} title="Chat with others" selected={index === 4}/>
                        {props.state.userIsAdmin ? <NavbarOption onClick={() => {
                        }} title="Report Page" selected={index === 5}/> : <></>}
                        {props.state.userIsAdmin ? <NavbarOption onClick={() => {
                        }} title="Log out" selected={false}/> : <></>}
                    </div> : <></>
                }
            </div>
            <Outlet/>
        </div>
    );
}
