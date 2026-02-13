# A2UI Protocol Reference (v0.8)

A2UI (Agent User Interaction) is a Google-led open standard (v0.8) for enabling AI agents to interact with rich, structured user interfaces securely and efficiently.

## Design Philosophy: Secure, Flat, and Streaming
- **Declarative Data Format**: Agents send a manifest of components and properties. No executable code or risky scripts are ever sent across the wire.
- **Adjacency List Model**: Components are defined in a flat array, referencing each other by ID. This eliminates deeply nested JSON structures and is easier for LLMs to generate.
- **Progressive Rendering**: Clients can begin rendering the UI as soon as the first few components arrive in the stream.
- **Framework Agnostic**: Native renderers exist for React, Flutter, Angular, and native mobile.

## Core Messages
- **`surfaceUpdate`**: Updates the UI surface with new components based on the adjacency list model.
- **`dataModelUpdate`**: Updates the shared data model that components are bound to.
- **`beginRendering`**: Signals the start of a UI rendering session.
- **`deleteSurface`**: Removes a UI surface.

## Technical Components
- **Surfaces**: Logical containers for UI (e.g., a modal, a side panel, a full dashboard).
- **Standard Catalog**: A set of pre-approved widgets (Buttons, Charts, Input Fields) that the client knows how to render.
- **Transports**: Communication layers like A2A that move A2UI messages between Agent and Client.

## Authors & Licensing
- **License**: Apache 2.0
- **Authors**: Google with contributions from CopilotKit and the open source community.
