import { StudioSession } from "./StudioSession";
import { AudioWorkflow } from "./AudioWorkflow";
import puppeteer from "@cloudflare/puppeteer";

export { StudioSession, AudioWorkflow };

// Define types locally if global types are not being picked up correctly by the IDE
interface Env {
    ANALYTICS: AnalyticsEngineDataset;
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

        // 0. Legal Pretty URLs (Redirect or Rewrite to .html)
        if (url.pathname === "/privacy_policy") {
            return env.ASSETS.fetch(new Request(`${url.origin}/privacy_policy.html`, request));
        }
        if (url.pathname === "/terms_of_service") {
            return env.ASSETS.fetch(new Request(`${url.origin}/terms_of_service.html`, request));
        }

        // 1. Analytics Engine Tracking
        if (url.pathname === "/api/analytics/log") {
            const data = await request.json() as any;
            env.ANALYTICS.writeDataPoint({
                'blobs': [data.city || "Unknown", data.os || "Unknown", "SoloCraft-Web"],
                'doubles': [data.sessionDuration || 0, 1.0], // Duration, Count
                'indexes': [data.userId || "anonymous"]
            });
            return new Response("Data logged", { status: 200 });
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

        // 5. Durable Object Routing
        if (url.pathname.startsWith("/api/studio/")) {
            const id = env.STUDIO_SESSION.idFromName(url.pathname);
            const stub = env.STUDIO_SESSION.get(id);
            return stub.fetch(request);
        }

        // 6. Workflow Management
        if (url.pathname === "/api/workflow/start" && request.method === "POST") {
            const payload = await request.json() as any;
            const instance = await (env.MY_WORKFLOW as any).create({
                params: { projectId: payload.projectId, audioUrl: payload.audioUrl }
            });
            return Response.json({ id: instance.id });
        }

        // 7. Static Asset Serving (Fallback with CORS support)
        try {
            const assetResponse = await env.ASSETS.fetch(request);
            
            // Add CORS context if it's an API request or fallback
            if (url.pathname.startsWith("/api/")) {
                const corsHeaders = new Headers(assetResponse.headers);
                corsHeaders.set("Access-Control-Allow-Origin", "*");
                corsHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                corsHeaders.set("Access-Control-Allow-Headers", "Content-Type");
                
                return new Response(assetResponse.body, {
                    status: assetResponse.status,
                    statusText: assetResponse.statusText,
                    headers: corsHeaders
                });
            }
            
            return assetResponse;
        } catch (e) {
            return new Response("Resource Not Found", { status: 404 });
        }
    }
};
