'use client';

import React from 'react';
import { Text } from '@react-three/drei';

type TextProps = React.ComponentProps<typeof Text>;

// Thin wrapper around drei's <Text> (troika-three-text) that always pins an
// explicit, locally self-hosted font. Without a `font` prop, troika treats
// every character as needing its CDN-based unicode-font-resolver fallback —
// on a restricted/offline network that fetch hangs forever and silently
// freezes the whole R3F scene in a Suspense fallback. Self-hosting the font
// also means the label text no longer depends on any third-party host at all.
export const Label = (props: TextProps) => <Text font="/fonts/Inter-Regular.ttf" {...props} />;
