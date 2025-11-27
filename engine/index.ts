import { serve } from "bun";
import index from "./index.html";
import path from "path";

const server = serve({
    port: 3001,
    routes: {
        // Serve context.json
        "/context.json": async (req) => {
            const contextPath = path.join(process.cwd(), "context.json");
            const file = Bun.file(contextPath);

            if (await file.exists()) {
                return new Response(file, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }

            return new Response(JSON.stringify({ error: "context.json not found. Run 'bun run context:build' first." }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        },

        // Serve index.html for all unmatched routes.
        "/*": index,
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
});

console.log(`Context Engine running at ${server.url}`);
