'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark', // or default based on preferred mode
    securityLevel: 'loose', // ensure it renders
});

export default function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {
        let currentProcess = true;

        async function renderChart() {
            if (ref.current && chart) {
                try {
                    // Remove backticks if Nova added them
                    const cleanChart = chart.replace(/^```mermaid\n?/, '').replace(/\n?```$/, '');
                    const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, cleanChart);
                    if (currentProcess) {
                        setSvgContent(svg);
                    }
                } catch (error) {
                    console.error("Mermaid parsing error: ", error);
                    if (currentProcess) {
                        setSvgContent(`<div class="text-red-500 p-4 bg-red-900/20 rounded-md border border-red-800">Failed to render diagram</div>`);
                    }
                }
            }
        }

        renderChart();

        return () => { currentProcess = false; };
    }, [chart]);

    return <div className="mermaid flex justify-center w-full" ref={ref} dangerouslySetInnerHTML={{ __html: svgContent }} />;
}
