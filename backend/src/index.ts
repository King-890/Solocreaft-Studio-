import { StudioSession } from "./StudioSession";
import { AudioWorkflow } from "./AudioWorkflow";
import puppeteer from "@cloudflare/puppeteer";
import { Client } from "pg";

export { StudioSession, AudioWorkflow };

// Define types locally if global types are not being picked up correctly by the IDE
// These should ideally come from @cloudflare/workers-types
interface Env {
    MY_DB: D1Database;
    AI: any;
    MYBROWSER: any;
    STUDIO_SESSION: DurableObjectNamespace<StudioSession>;
    MY_WORKFLOW: Workflow<AudioWorkflow>;
    ASSETS: Fetcher;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // 1. Analytics Engine Tracking (Disabled - Requires Cloudflare Analytics Engine)
        if (url.pathname === "/api/analytics/log") {
            return new Response("Analytics disabled", { status: 200 });
        }

        // 2. Workers AI Integration
        if (url.pathname === "/api/ai/ask") {
            const { prompt } = await request.json() as any;
            const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
                prompt: prompt || "Explain music theory briefly."
            });
            return new Response(JSON.stringify(response), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. D1 Database Integration
        if (url.pathname === "/api/db/history") {
            const result = await env.MY_DB.prepare(
                "SELECT * FROM Projects ORDER BY CreatedDate DESC LIMIT 10"
            ).all();
            return new Response(JSON.stringify(result), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 4. Browser Rendering Integration
        if (url.pathname === "/api/render") {
            const target = url.searchParams.get("url");
            if (!target) return new Response("Missing url param", { status: 400 });

            const browser = await puppeteer.launch(env.MYBROWSER);
            const page = await browser.newPage();
            await page.goto(target);
            const screenshot = await page.screenshot();
            await browser.close();
            
            return new Response(screenshot, {
                headers: { "Content-Type": "image/jpeg" }
            });
        }


        // 6. Durable Object Routing
        if (url.pathname.startsWith("/api/studio/")) {
            const id = env.STUDIO_SESSION.idFromName(url.pathname);
            const stub = env.STUDIO_SESSION.get(id);
            return stub.fetch(request);
        }

        // 7. Workflow Management
        if (url.pathname === "/api/workflow/start" && request.method === "POST") {
            const payload = await request.json() as any;
            const instance = await (env.MY_WORKFLOW as any).create({
                params: { projectId: payload.projectId, audioUrl: payload.audioUrl }
            });
            return Response.json({ id: instance.id });
        }

        // 8. Pretty URLs for Legal Pages
        if (url.pathname === "/privacy_policy") {
            return env.ASSETS.fetch(new Request(new URL("/privacy_policy.html", request.url), request));
        }
        if (url.pathname === "/terms_of_service") {
            return env.ASSETS.fetch(new Request(new URL("/terms_of_service.html", request.url), request));
        }

        // 9. Static Asset Serving (Fallback)
        return env.ASSETS.fetch(request);
    }
};
