import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import cors from 'cors';
import axios from 'axios';

// Environment
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8000';

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// Create MCP Server
const server = new Server({
    name: "InsightX MCP",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});

// Tool Handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "run_forecast",
                description: "Run a forecast for a given dataset",
                inputSchema: {
                    type: "object",
                    properties: {
                        dataset_id: {
                            type: "number",
                            description: "The ID of the dataset to forecast"
                        },
                        horizon: {
                            type: "number",
                            description: "Number of days to forecast",
                            default: 30
                        }
                    },
                    required: ["dataset_id"]
                }
            },
            {
                name: "explain_chart",
                description: "Explain a chart based on context",
                inputSchema: {
                    type: "object",
                    properties: {
                        chart_context: {
                            type: "string",
                            description: "Context or data summary of the chart"
                        }
                    },
                    required: ["chart_context"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "run_forecast") {
        const dataset_id = Number(args?.dataset_id);
        const horizon = Number(args?.horizon) || 30;

        if (isNaN(dataset_id)) {
            throw new Error("Invalid dataset_id");
        }

        try {
            // Call main backend
            const res = await axios.post(`${BACKEND_URL}/api/tools/run_forecast`, { dataset_id, horizon });
            return {
                content: [{ type: "text", text: `Forecast started: ${res.data.message}` }]
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Error running forecast: ${err.message}` }],
                isError: true,
            };
        }
    }

    if (name === "explain_chart") {
        const chart_context = String(args?.chart_context || "");

        // Mock implementation for demo
        return {
            content: [{ type: "text", text: `Explanation for ${chart_context}: Trend is upwards with high confidence.` }]
        };
    }

    throw new Error(`Tool not found: ${name}`);
});

// Expose SSE Endpoint for Copilot/Client to connect
app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
});

// Message endpoint for SSE transport
app.post('/messages', async (req, res) => {
    // The SSE transport will handle the message processing via the /sse connection context
    // This endpoint receives the POST requests and the transport (connected in /sse) 
    // needs to be aware of it.
    // In the official SDK, SSEServerTransport expects 'handlePostMessage' to be called logic?
    // Let's check SSEServerTransport usage in docs or assume standard behavior.
    // However, since we create a NEW transport on every /sse connection, how do we route the POST to the correct transport?
    // Standard MCP via SSE usually has a session ID. 
    // For this simple implementation, we might need a mapping or the SDK handles it if we pass the request to the *specific* transport instance.
    // But here 'transport' is local to the /sse closure.
    // The typical pattern:
    // GET /sse -> upgrades to SSE, creates session.
    // POST /messages?sessionId=... -> handles message.

    // For now, let's keep the user's structure but note the potential issue.
    // The SSEServerTransport in the SDK:
    // constructor(endpoint: string, res: ServerResponse)
    // It sends events to 'res'.
    // It doesn't listen to POST itself. We need to feed it.
    // Reference: "server.connect(transport)"

    // We'll leave the POST handler empty/mocked as it was, but this is likely broken code logic from the start.
    // But sticking to fixing "Build Errors" first.

    // Re-reading original code:
    // app.post('/messages', async (req, res) => { res.sendStatus(200); });
    // It seems it was just a placeholder.
    // Let's implement a basic fix: Use a global transport variable? No, supports only 1 client.
    // Getting this to compile is step 1.
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
});
