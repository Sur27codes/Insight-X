import React from 'react';
import { createComponent } from '@lit-labs/react';
import { v0_8 } from '@a2ui/lit';
const { Surface } = v0_8.UI;

export const A2UISurface = createComponent({
    react: React,
    tagName: 'a2ui-surface',
    elementClass: Surface,
});

// Note: A real implementation would need to instantiate A2uiMessageProcessor
// and feed the JSONL stream to it, then pass the processor state to A2UISurface.
