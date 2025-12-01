import { useIntl } from "react-intl";

export enum ContactMethod {
    Email = "email",
    Phone = "phone",
    Mail = "mail",
    InPerson = "in_person"
}

export enum Priority {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

export enum Rating {
    Bad,
    Ok,
    Good
}

export interface MoreInfo {
    field: string;
    field2: { sss: number };
    field3: number;
    field4: boolean;
}

export interface ContactPageProps {
    title: string;
    description: string;
    email: string;
    phoneNumbers: string[];
    referenceNumber: number;
    isAvailable: boolean;
    availableDate: Date | null;
    preferredContactMethod: ContactMethod;
    priority: Priority;
    rating: Rating;
    moreInfo: MoreInfo;
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
                <li>Preferred Contact: {props.preferredContactMethod}</li>
                <li>Priority: {Priority[props.priority]}</li>
                <li>Rating: {Rating[props.rating]}</li>
                <li>
                   More info:
                   <pre>{JSON.stringify(props.moreInfo, null, 4)}</pre>
                </li>
            </ul>
        </div>
    );
};
