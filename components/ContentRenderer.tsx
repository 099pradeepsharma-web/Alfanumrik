import React, { ReactNode } from 'react';

interface ContentRendererProps {
  content: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
    const lines = content.split('\n');
    const elements: ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let currentDiagram: string[] | null = null;

    const flushList = () => {
        if (currentList) {
            const ListComponent = currentList.type;
            elements.push(
                <ListComponent key={`list-${elements.length}`} className={`${ListComponent === 'ul' ? 'list-disc' : 'list-decimal'} pl-6 space-y-2 my-4`}>
                    {currentList.items.map((item, i) => <li key={i}>{item}</li>)}
                </ListComponent>
            );
            currentList = null;
        }
    };

    const flushDiagram = () => {
        if (currentDiagram) {
            elements.push(
                <pre key={`diagram-${elements.length}`} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 border border-slate-200 dark:border-slate-600">
                    <code>{currentDiagram.join('\n')}</code>
                </pre>
            );
            currentDiagram = null;
        }
    };

    // Heuristic for what looks like a diagram line vs text
    const isDiagramLine = (line: string): boolean => {
        if (line.trim().length === 0 && lines.length > 1) return false;
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return true; // empty lines within diagram
        const nonWhitespaceChars = line.replace(/\s/g, '');
        if (nonWhitespaceChars.length < 3) return false;
        
        const specialChars = nonWhitespaceChars.replace(/[a-zA-Z0-9,.!"'()]/g, '');
        const ratio = specialChars.length / nonWhitespaceChars.length;
        
        // High ratio of special chars, or common diagram elements
        return ratio > 0.35 || line.includes('-->') || line.includes('|-') || /^\s*[+|/\\]/.test(line) || line.includes('<--');
    }
    
    let isPotentiallyInDiagram = false;

    lines.forEach((line) => {
        const unorderedMatch = line.match(/^\s*[-*]\s+(.*)/);
        const orderedMatch = line.match(/^\s*\d+\.\s+(.*)/);

        if (unorderedMatch) {
            flushDiagram();
            if (currentList?.type !== 'ul') flushList();
            if (!currentList) currentList = { type: 'ul', items: [] };
            currentList.items.push(unorderedMatch[1]);
            isPotentiallyInDiagram = false;
        } else if (orderedMatch) {
            flushDiagram();
            if (currentList?.type !== 'ol') flushList();
            if (!currentList) currentList = { type: 'ol', items: [] };
            currentList.items.push(orderedMatch[1]);
            isPotentiallyInDiagram = false;
        } else if (isDiagramLine(line) || (isPotentiallyInDiagram && line.trim().length > 0) ) {
            flushList();
            if (!currentDiagram) currentDiagram = [];
            currentDiagram.push(line);
            isPotentiallyInDiagram = true;
        } else {
            flushList();
            flushDiagram();
            isPotentiallyInDiagram = false;
            if (line.trim().length > 0) {
                 if (line.length < 80 && /:$/.test(line.trim()) && !line.includes('e.g.')) {
                     elements.push(<h4 key={`heading-${elements.length}`} className="text-lg font-semibold mt-6 mb-2 text-slate-700 dark:text-slate-200">{line}</h4>);
                 } else {
                     elements.push(<p key={`p-${elements.length}`} className="my-4 leading-relaxed">{line}</p>);
                 }
            }
        }
    });

    flushList();
    flushDiagram();

    return <div className="text-slate-700 dark:text-slate-300">{elements}</div>;
};

export default ContentRenderer;
