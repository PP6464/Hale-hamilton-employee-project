import "./styles.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "./redux/state";
import {logIn} from "./redux/actions";
import Navbar from "./navbar/navbar";
import Auth from "./auth/auth";
import Home from "./home/home";

interface AppProps {
    appState: AppState;
    logIn: (uid: string, accessToken: string, userIsAdmin: boolean) => {};
}

function App(props: AppProps) {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navbar/>}>
                    <Route index element={<Auth logIn={props.logIn}/>}/>
                    <Route path="/home" element={<Home/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const mapStateToProps = (state: AppState) => ({
    appState: state
});
const mapDispatchToProps = (dispatch: any) => ({
    logIn: (uid: string, accessToken: string, userIsAdmin: boolean) =>
        dispatch(logIn(uid, accessToken, userIsAdmin))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
