import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/backend";

export const runtime = "edge";

export async function POST(req: Request) {
    const copilotKit = new CopilotRuntime({
        actions: [
            {
                name: "get_forecast",
                description: "Get the forecast for a stock ticker. Returns an A2UI payload.",
                parameters: [
                    {
                        name: "ticker",
                        type: "string",
                        description: "The stock ticker symbol (e.g. AAPL)",
                        required: true,
                    },
                ],
                handler: async ({ ticker }) => {
                    console.log(`Getting forecast for ${ticker}`);
                    // In a real implementation, this would call the MCP server.
                    // For now, we return the A2UI JSON structure directly.

                    const a2uiPayload = {
                        surfaceUpdate: {
                            surfaceId: "forecast-card",
                            components: [
                                {
                                    id: "root",
                                    component: {
                                        Column: {
                                            children: {
                                                explicitList: ["header", "stats_row", "chart_container"]
                                            }
                                        }
                                    }
                                },
                                {
                                    id: "header",
                                    component: {
                                        Text: {
                                            text: { literalString: `Advanced Forecast: ${ticker}` },
                                            usageHint: "h2"
                                        }
                                    }
                                },
                                {
                                    id: "stats_row",
                                    component: {
                                        Row: {
                                            children: {
                                                explicitList: ["confidence_score", "trend_indicator"]
                                            }
                                        }
                                    }
                                },
                                {
                                    id: "confidence_score",
                                    component: {
                                        Text: {
                                            text: { literalString: "Confidence: 94%" },
                                            usageHint: "caption"
                                        }
                                    }
                                },
                                {
                                    id: "trend_indicator",
                                    component: {
                                        Text: {
                                            text: { literalString: "Trend: Bullish" },
                                            usageHint: "caption"
                                        }
                                    }
                                },
                                {
                                    id: "chart_container",
                                    component: {
                                        Card: {
                                            child: "chart_content"
                                        }
                                    }
                                },
                                {
                                    id: "chart_content",
                                    component: {
                                        Text: {
                                            text: { literalString: "Professional analytics chart rendered via InsightX Engine." }
                                        }
                                    }
                                }
                            ]
                        }
                    };

                    const beginRendering = {
                        beginRendering: {
                            root: "root",
                            surfaceId: "forecast-card"
                        }
                    };

                    // Return stringified JSONL or just the object if CopilotKit handles it.
                    // Assuming we return a string message for the LLM to process or the UI to render.
                    return JSON.stringify(a2uiPayload) + "\n" + JSON.stringify(beginRendering);
                },
            },
        ],
    });

    // Use OpenAI as the LLM provider
    const serviceAdapter = new OpenAIAdapter({ model: "gpt-4-turbo" });

    return copilotKit.response(req, serviceAdapter);
}

