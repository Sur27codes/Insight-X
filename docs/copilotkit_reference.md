# CopilotKit: The Agentic Application Framework

CopilotKit is the infrastructure layer for building "Agent-Native" applications. It orchestrates the connection between LLMs, tools, and the frontend.

## Key Features (v1.50+)
- **AG-UI Protocol Handshake**: Seamless interoperability between different agentic protocols using a standardized handshake mechanism.
- **Generative UI (GenUI)**: Native support for rendering custom components in the chat window via `useRenderToolCall` and `useCoAgentStateRender`.
- **Shared State (`useCoAgent`)**: Bidirectional state synchronization between the React frontend and the backend agent (LangGraph, CrewAI, ADK, etc.).
- **Human-in-the-Loop (HITL)**: Built-in hooks for approval workflows and user-agent collaboration.

## Technical Architecture
- **Copilot Runtime (Backend)**: The component that interfaces with LLMs (OpenAI, Anthropic, Gemini, Groq) and executes actions.
- **Adapters**: High-level wrappers for common LLM providers and agent frameworks.
- **Remote Endpoints**: Allows connecting Python-based agents to a Next.js frontend via an HTTP bridge.

## A2UI & AG-UI Integration
CopilotKit is a primary implementer of the AG-UI and A2UI specifications. It acts as the "Agentic Frontend" that turns abstract agent definitions into rendered, styled components.
