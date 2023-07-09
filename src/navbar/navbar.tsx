import "./navbar.css";
import {useEffect, useState} from "react";
import {Outlet, useLocation} from "react-router-dom";
import Menu from "@mui/icons-material/Menu";
import Clear from "@mui/icons-material/Clear";
import ToggleIcon from "material-ui-toggle-icon";
import IconButton from "@mui/material/IconButton";

export default function Navbar() {
    const [menuOn, setMenuOn] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const location = useLocation();

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
                    <img src="./assets/logo.svg" alt=""/>
                    <h2 style={{fontSize: windowWidth < 500 ? "1em" : "1.5em"}}>
                        Employee Management
                    </h2>
                    {location.pathname !== "/" ? (
                        <IconButton
                            title={menuOn ? "Show menu" : "Hide menu"}
                            onClick={toggleMenuOn}
                            style={{color: "white"}}
                        >
                            <ToggleIcon on={menuOn} onIcon={<Menu/>} offIcon={<Clear/>}/>
                        </IconButton>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
            <Outlet/>
        </div>
    );
}
