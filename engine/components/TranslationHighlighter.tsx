import React, { useEffect, useRef } from "react";
import { IntlProvider } from "react-intl";

interface TranslationHighlighterProps {
    messages: Record<string, string>;
    locale: string;
    defaultLocale: string;
    hoveredTranslationKey: string | null;
    children: React.ReactNode;
}

export default function TranslationHighlighter({
    messages,
    locale,
    defaultLocale,
    hoveredTranslationKey,
    children,
}: TranslationHighlighterProps) {
    return (
        <IntlProvider
            messages={messages}
            locale={locale}
            defaultLocale={defaultLocale}
        >
            <TranslationWrapper
                hoveredTranslationKey={hoveredTranslationKey}
                messages={messages}
            >
                {children}
            </TranslationWrapper>
        </IntlProvider>
    );
}

interface TranslationWrapperProps {
    hoveredTranslationKey: string | null;
    messages: Record<string, string>;
    children: React.ReactNode;
}

function TranslationWrapper({
    hoveredTranslationKey,
    messages,
    children,
}: TranslationWrapperProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const textNodeMapRef = useRef<Map<string, Text[]>>(new Map());

    // Build a map of translation keys to text nodes
    useEffect(() => {
        if (!wrapperRef.current) return;

        const textNodeMap = new Map<string, Text[]>();

        // Walk through all text nodes and match them to translation values
        const walker = document.createTreeWalker(
            wrapperRef.current,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node: Node | null;
        while ((node = walker.nextNode())) {
            const textNode = node as Text;
            const text = textNode.textContent?.trim();

            if (!text) continue;

            // Check if this text matches any translation value
            for (const [key, value] of Object.entries(messages)) {
                if (text === value || text.includes(value)) {
                    if (!textNodeMap.has(key)) {
                        textNodeMap.set(key, []);
                    }
                    textNodeMap.get(key)!.push(textNode);
                }
            }
        }

        textNodeMapRef.current = textNodeMap;
    }, [messages, children]);

    // Apply/remove highlighting based on hovered key
    useEffect(() => {
        if (!wrapperRef.current) return;

        const textNodeMap = textNodeMapRef.current;

        // Remove all existing highlights
        const existingHighlights =
            wrapperRef.current.querySelectorAll(".translation-highlight");
        existingHighlights.forEach((highlight) => {
            const parent = highlight.parentNode;
            if (parent) {
                const textContent = highlight.textContent || "";
                const textNode = document.createTextNode(textContent);
                parent.replaceChild(textNode, highlight);
            }
        });

        // If no key is hovered, we're done
        if (!hoveredTranslationKey) return;

        // Get the text nodes for the hovered key
        const textNodes = textNodeMap.get(hoveredTranslationKey);
        if (!textNodes) return;

        // Wrap each text node in a highlight span
        textNodes.forEach((textNode) => {
            const parent = textNode.parentElement;
            if (!parent) return;

            const highlightSpan = document.createElement("span");
            highlightSpan.className = "translation-highlight";
            highlightSpan.style.cssText = `
                outline: 2px solid rgb(168, 85, 247);
                outline-offset: 2px;
                border-radius: 0.375rem;
                background-color: rgba(168, 85, 247, 0.1);
                transition: all 200ms ease;
                box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.5);
                display: inline;
            `;

            // Replace text node with highlighted span
            const text = textNode.textContent || "";
            highlightSpan.textContent = text;

            try {
                parent.replaceChild(highlightSpan, textNode);
            } catch (e) {
                // If replacement fails, skip this node
                console.warn("Failed to highlight text node:", e);
            }
        });

        // Cleanup: restore original text nodes when hoveredTranslationKey changes
        return () => {
            const highlights =
                wrapperRef.current?.querySelectorAll(".translation-highlight");
            highlights?.forEach((highlight) => {
                const parent = highlight.parentNode;
                if (parent) {
                    const textContent = highlight.textContent || "";
                    const textNode = document.createTextNode(textContent);
                    parent.replaceChild(textNode, highlight);
                }
            });
        };
    }, [hoveredTranslationKey]);

    return <div ref={wrapperRef}>{children}</div>;
}
