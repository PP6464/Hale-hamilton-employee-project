interface ToggleIconProps {
    on: boolean,
    onIcon: JSX.Element,
    offIcon: JSX.Element,
}

export default function ToggleIcon(props: ToggleIconProps) {
    return (<>{props.on ? props.onIcon : props.offIcon}</>);
}