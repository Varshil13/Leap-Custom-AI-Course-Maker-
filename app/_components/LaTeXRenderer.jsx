import React from 'react';
import 'katex/dist/katex.min.css';

const LaTeXRenderer = ({ content }) => {
  // Parse LaTeX content and convert to HTML with proper formatting
  const parseLatexToHtml = (latexContent) => {
    if (!latexContent) return '';

    let html = latexContent;

    // Convert sections and subsections
    html = html.replace(/\\section\{([^}]+)\}/g, '<h2 class="text-2xl font-bold mb-4 text-foreground">$1</h2>');
    html = html.replace(/\\subsection\{([^}]+)\}/g, '<h3 class="text-xl font-semibold mb-3 text-foreground">$1</h3>');

    // Convert itemize lists - process BEFORE other conversions
    html = html.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, items) => {
      // Extract each \item and its content more precisely
      const itemMatches = items.match(/\\item\s+([^\\]*?)(?=\\item|$)/gs);
      if (itemMatches) {
        const listItems = itemMatches
          .map(item => item.replace(/\\item\s+/, '').trim())
          .filter(item => item.length > 0)
          .map(item => `<li class="mb-3 text-foreground leading-relaxed">${item}</li>`)
          .join('');
        return `<ul class="list-disc list-outside mb-6 ml-6 space-y-2">${listItems}</ul>`;
      }
      return match;
    });

    // Convert enumerate lists  
    html = html.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, items) => {
      const itemMatches = items.match(/\\item\s+([^\\]*?)(?=\\item|$)/gs);
      if (itemMatches) {
        const listItems = itemMatches
          .map(item => item.replace(/\\item\s+/, '').trim())
          .filter(item => item.length > 0)
          .map(item => `<li class="mb-3 text-foreground leading-relaxed">${item}</li>`)
          .join('');
        return `<ol class="list-decimal list-outside mb-6 ml-6 space-y-2">${listItems}</ol>`;
      }
      return match;
    });

    // Convert lstlisting code blocks to simple formatted text (process before other conversions)
    html = html.replace(/\\begin\{lstlisting\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{lstlisting\}/g, (match, code) => {
      // Clean up the code and display it as simple formatted text
      const cleanCode = code.trim()
        .replace(/\\\\/g, '\\') // Unescape backslashes
        .replace(/\\{/g, '{')   // Unescape braces  
        .replace(/\\}/g, '}')
        .replace(/&lt;/g, '<')  // Unescape HTML entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

      return `<div class="my-6 p-4 rounded-lg" style="background: #1a1a1a; border: 1px solid #333;">
        <pre style="margin: 0; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 14px; line-height: 1.6; color: #e6edf3; white-space: pre; overflow-x: auto;">${cleanCode}</pre>
      </div>`;
    });

    // Convert basic text formatting
    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong class="font-semibold text-foreground">$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em class="italic text-foreground">$1</em>');
    html = html.replace(/\\texttt\{([^}]+)\}/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">$1</code>');

    // Clean up any remaining LaTeX commands that weren't processed
    html = html.replace(/\\item\s*/g, '• ');
    html = html.replace(/\\begin\{[^}]+\}/g, '');
    html = html.replace(/\\end\{[^}]+\}/g, '');

    // Convert paragraphs - split by double newlines but preserve formatting
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs
      .filter(p => p.trim())
      .map(p => `<p class="mb-4 text-muted-foreground leading-relaxed">${p.trim()}</p>`)
      .join('');

    // Clean up extra spaces and newlines
    html = html.replace(/\s+/g, ' ');

    return html;
  };

  const htmlContent = parseLatexToHtml(content);

  return (
    <div 
      className="latex-content prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: '1.6',
        color: 'var(--foreground)'
      }}
    />
  );
};

export default LaTeXRenderer;
