import { DurableObject } from "cloudflare:workers";

interface Env {
    // Shared environment bindings
}

export class StudioSession extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    /**
     * Handles incoming synchronization requests for collaborative editing.
     */
    async fetch(request: Request) {
        const url = new URL(request.url);
        
        // Simple state management example
        if (url.pathname === "/state") {
            const state = await this.ctx.storage.get("project_state") || {};
            return new Response(JSON.stringify(state), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (request.method === "POST" && url.pathname === "/update") {
            const update = await request.json() as any;
            const currentState: any = await this.ctx.storage.get("project_state") || {};
            const newState = { ...currentState, ...update };
            await this.ctx.storage.put("project_state", newState);
            return new Response("Updated", { status: 200 });
        }

        // Real-time coordination logic (SQL feature removed to ensure Free plan compatibility)
        if (url.pathname === "/hello") {
            return new Response("Hello from SoloCraft Studio DO!");
        }

        return new Response("Not Found", { status: 404 });
    }
}
