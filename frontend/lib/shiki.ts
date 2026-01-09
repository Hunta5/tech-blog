// lib/shiki.ts
import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export function getShikiHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ['github-light', 'github-dark'],
            langs: [
                'javascript',
                'typescript',
                'bash',
                'json',
                'yaml',
                'swift',
            ],
        });
    }
    return highlighterPromise;
}