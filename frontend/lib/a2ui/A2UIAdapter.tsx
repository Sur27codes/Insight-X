'use client';

import React from 'react';
import { createComponent } from '@lit-labs/react';
import { Surface } from '@a2ui/lit/ui';

export const A2UISurface = createComponent({
    tagName: 'a2ui-surface',
    elementClass: Surface,
    react: React,
    events: {
        // Add any events emitted by the component here if needed
    },
});
