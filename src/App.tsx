import { BrowserRouter, Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import { AppState, User } from "./redux/state";
import { logIn, logOut, updateUser } from "./redux/actions";
import Navbar from "./navbar/navbar";
import Auth from "./auth/auth";
import Home from "./home/home";
import NoPage from "./no-page/no-page";
import Profile from "./profile/profile";
import ChatWithOthers from "./chat/chat";
import Notifications from "./notifications/notificiatons";
import Reports from "./reports/reports";

interface AppProps {
  appState: AppState;
  logIn: (user: User, accessToken: string) => {};
  logOut: () => {};
  updateUser: (name?: string, photoURL?: string) => {};
}

function App(props: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navbar state={props.appState} logOut={props.logOut} />}
        >
          <Route index element={<Auth logIn={props.logIn} />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/profile"
            element={
              <Profile state={props.appState} updateUser={props.updateUser} />
            }
          />
          <Route
            path="/notifications"
            element={<Notifications state={props.appState} />}
          />
          <Route
            path="/chat-with-others"
            element={<ChatWithOthers state={props.appState} />}
          />
          <Route path="/reports" element={<Reports state={props.appState} />} />
          <Route path="*" element={<NoPage state={props.appState} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const mapStateToProps = (state: AppState) => ({
  appState: state,
});
const mapDispatchToProps = (dispatch: any) => ({
  logIn: (user: User, accessToken: string) =>
    dispatch(logIn(user, accessToken)),
  logOut: () => dispatch(logOut()),
  updateUser: (name?: string, photoURL?: string) =>
    dispatch(updateUser(name, photoURL)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
