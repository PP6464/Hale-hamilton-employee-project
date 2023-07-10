import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {createStore} from "redux";
import {Provider} from "react-redux";
import reducer from "./redux/state";
import "./index.css";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);
const store = createStore(reducer);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>
);
