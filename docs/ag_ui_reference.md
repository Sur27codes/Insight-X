# AG-UI (Agent-User Interaction) Protocol Reference

AG-UI is a specialized protocol designed to bridge the gap between AI agents and human users. It focuses on the unique requirements of "agentic" applications.

## Core Characteristics
- **Long-Running & Streaming**: Agents often run for extended periods and need to stream intermediate work and reasoning.
- **Nondeterministic UI**: Agents can control the application interface in ways that aren't hardcoded, adapting to the user's needs.
- **Mixed IO**: Simultaneously handles structured data (JSON, tool calls) and unstructured data (text, voice).
- **Interactive Composition**: Supports agents calling sub-agents recursively, with the UI reflecting this hierarchy.

## Generative UI Support
AG-UI is a platform-agnostic specification. It defines how Generative UI (GenUI) should be structured to ensure compatibility across different frontend frameworks.

## Integration Partners
- **LangGraph**: Native support for LangChain's orchestration framework.
- **CrewAI**: Full integration for multi-agent systems.
- **CopilotKit**: Acts as the primary "Agentic Application Framework" implementing AG-UI at the frontend level.
- **Google ADK**: Support for Google's Agent Development Kit.

## Key Resources
- [AG-UI Docs](https://docs.ag-ui.com)
- [AG-UI Dojo](https://dojo.ag-ui.com)
