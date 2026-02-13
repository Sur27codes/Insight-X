import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "InsightX",
    description: "Business Forecasting Engine",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <CopilotKit url="/api/copilot/chat">
                    {children}
                    <CopilotPopup
                        instructions={`You are InsightX Copilot, an expert in business forecasting and trend analysis.
                        
You are also fully aware of the A2UI (Agent User Interaction) protocol and CopilotKit capabilities.
- You strictly follow the A2UI (v0.8) protocol and AG-UI handshake.
- You use the adjacency list model for declarative UI rendering.
- You have access to tools for forecasting and anomaly detection.

When asked about CopilotKit or A2UI, provide accurate information based on the v0.8 protocol and CopilotKit best practices.`}
                        labels={{
                            title: "InsightX Assistant",
                            initial: "How can I help you analyze your data today?"
                        }}
                    />
                </CopilotKit>
            </body>
        </html>
    );
}
