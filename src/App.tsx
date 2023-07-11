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
import { onMessageListener } from "./firebase/firebase";
import { useEffect, useState } from "react";

interface AppProps {
  appState: AppState;
  logIn: (user: User, accessToken: string) => {};
  logOut: () => {};
  updateUser: (name?: string, photoURL?: string) => {};
}

type Notification = {
  title: string;
  body: string;
};

function App(props: AppProps) {
  const iconURL =
    "https://firebasestorage.googleapis.com/v0/b/hale-hamilton-employee-project.appspot.com/o/assets%2Flogo-black.svg?alt=media&token=e05f14b4-a7c0-4ee9-b0df-18c1c9e208bf";
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (notification) {
      new Notification(notification.title, {
        body: notification.body,
        icon: iconURL,
      });
    }
  }, [notification]);

  onMessageListener().then((payload: any) => {
    setNotification({
      title: payload.notification.title,
      body: payload.notification.body,
    });
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navbar state={props.appState} logOut={props.logOut} />}
        >
          <Route index element={<Auth logIn={props.logIn} />} />
          <Route path="/home" element={<Home state={props.appState} />} />
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
