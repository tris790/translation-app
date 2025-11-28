import "./StyledTestComponent.css";
import { useIntl } from "react-intl";

export interface StyledTestComponentProps {
  title: string;
  description: string;
  showButton?: boolean;
}

export function StyledTestComponent({
  title,
  description,
  showButton = true
}: StyledTestComponentProps) {
  const intl = useIntl();

  return (
    <div className="test-container">
      <h1 className="test-title">{title}</h1>
      <p className="test-description">{description}</p>
      {showButton && (
        <button className="test-button">
          {intl.formatMessage({ id: "test.button" })}
        </button>
      )}
    </div>
  );
}

export default StyledTestComponent;
