import "./navbar-option.css";

interface NavbarOptionProps {
    onClick: () => void,
    title: string,
    selected: boolean,
}

export default function NavbarOption(props: NavbarOptionProps) {
    return (
        <div className="navbar-option" onClick={props.onClick} data-is-logout={props.title === "Log out"}>
            <h1>{props.title}</h1>
        </div>
    );
}