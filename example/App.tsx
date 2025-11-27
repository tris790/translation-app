import { IntlProvider } from "react-intl";
import englishTranslations from "./translations/en-translation.json";
import frenchTranslations from "./translations/fr-translation.json";

import MainPage from "./components/MainPage";
import "./index.css";
import Nav from "./components/Nav";
import { useState } from "react";
import { FormPage } from "./components/FormPage";
import { ProductPage } from "./components/ProductPage";
import { ContactPage } from "./components/ContactPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function App() {
    const language = "en";
    const messages =
        language === "en" ? englishTranslations : frenchTranslations;
    const queryClient = new QueryClient();

    const [page, setPage] = useState("/");
    let content = <MainPage />;
    if (page === "/") {
        content = <MainPage />;
    } else if (page === "/form") {
        content = <FormPage />;
    } else if (page === "/contact") {
        content = (
            <ContactPage
                title="Bob"
                email="bob@gmail.com"
                phoneNumbers={["123-456-7890"]}
                referenceNumber={123}
                description="very cool"
            />
        );
    } else if (page === "/product") {
        content = <ProductPage />;
    }

    return (
        <IntlProvider messages={messages} locale={language} defaultLocale="en">
            <QueryClientProvider client={queryClient}>
                <div className="app">
                    <Nav
                        selectedPath={page}
                        onNavigate={(page) => setPage(page)}
                    />
                    {content}
                </div>
            </QueryClientProvider>
        </IntlProvider>
    );
}

export default App;
