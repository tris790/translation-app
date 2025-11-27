import { useIntl } from "react-intl";

export interface ContactPageProps {
    title: string;
    description: string;
    email: string;
    phoneNumbers: string[];
    referenceNumber: number;
    isAvailable: boolean;
    availableDate: Date | null;
}

export const ContactPage = (props: ContactPageProps) => {
    const intl = useIntl();

    return (
        <div>
            <h1>{intl.formatMessage({ id: "contact" })}</h1>
            <p>{props.title}</p>
            <p>{props.description}</p>
            <ul>
                <li>{props.email}</li>
                {props.phoneNumbers?.map((number, index) => (
                    <li key={index}>{number}</li>
                ))}
                <li>{props.referenceNumber}</li>
                <li>{props.isAvailable ? "Available" : "Not Available"}</li>
                <li>
                    {props.availableDate
                        ? props.availableDate.toLocaleDateString()
                        : "Not Available"}
                </li>
            </ul>
        </div>
    );
};
