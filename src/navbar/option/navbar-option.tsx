interface NavbarOptionProps {
    onClick: () => {},
    title: string,
    selected: boolean,
}

export default function NavbarOption(props: NavbarOptionProps) {
    return (
        <div className="navbar-option" onClick={props.onClick}>
            <h1>{props.title}</h1>
        </div>
    );
}