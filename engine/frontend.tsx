/**
 * This file is the entry point for the Context Engine React app.
 * It renders the Shell component which provides the core engine UI.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Shell from "./components/Shell";
import { ContextProvider } from "./components/ContextProvider";

const elem = document.getElementById("root")!;
const app = (
    <StrictMode>
        <ContextProvider>
            <Shell />
        </ContextProvider>
    </StrictMode>
);

if (import.meta.hot) {
    // With hot module reloading, `import.meta.hot.data` is persisted.
    const root = (import.meta.hot.data.root ??= createRoot(elem));
    root.render(app);
} else {
    // The hot module reloading API is not available in production.
    createRoot(elem).render(app);
}
