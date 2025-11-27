import { useIntl } from "react-intl";

export interface NavProps {
    selectedPath: string;
    onNavigate: (path: string) => void;
}

export default function Nav(props: NavProps) {
    const intl = useIntl();
    const navElements = [
        { label: intl.formatMessage({ id: "home" }), path: "/" },
        { label: intl.formatMessage({ id: "contact" }), path: "/contact" },
        { label: intl.formatMessage({ id: "product" }), path: "/product" },
        { label: intl.formatMessage({ id: "form" }), path: "/form" },
    ];

    return (
        <nav>
            <ul>
                {navElements.map((element) => (
                    <li key={element.path}>
                        <button
                            onClick={() => props.onNavigate(element.path)}
                            style={{
                                color:
                                    element.path === props.selectedPath
                                        ? "orange"
                                        : "",
                            }}
                        >
                            {element.label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
