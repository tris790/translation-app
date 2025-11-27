import { useIntl } from "react-intl";

export default function MainPage() {
    const intl = useIntl();

    return (
        <div>
            <h1>{intl.formatMessage({ id: "welcome" })}</h1>
            <p>{intl.formatMessage({ id: "description" })}</p>
        </div>
    );
}
