import type { TranslatorConfigObject } from 'node-html-markdown';

/**
 * Removes navigation aid links like "Skip to Content" and "Return to top" from markdown content.
 * These links are typically navigation aids that aren't useful in the markdown output.
 *
 * @param markdownContent The markdown content to process
 * @returns Processed markdown content with navigation links removed
 */
/**
 * Removes navigation aid links and phrases like "Return to top" from markdown content.
 */
export function removeNavigationAidLinks(markdownContent: string): string {
  // Remove markdown links
  let cleaned = markdownContent
    .replace(/\[(Skip to Content)\]\(#[^)]*\)/gi, '')
    .replace(
      /\[(Return to top|Back to top|Scroll to top|Go to top|Top)\]\(#[^)]*\)/gi,
      '',
    );

  // Remove standalone lines, headings, or bold/italic phrases
  const navPhrases = [
    'skip to content',
    'return to top',
    'back to top',
    'scroll to top',
    'go to top',
    'top',
    'previous page',
    'next page',
    'jump to',
    'back to home',
    'home',
  ];

  const copyPhrases = [
    'copy page',
    'copy page content',
    'copy page content to clipboard',
    'copy to clipboard',
    'share this page',
    'share on',
    'print this page',
    'download pdf',
    'report an issue',
    'improve this page',
    'edit this page',
  ];

  const phrasePattern = navPhrases
    .map(
      (p) =>
        `(?:^|[\\s\\*\\_\\#\\-]+)${p.replace(/ /g, '[\\s\\*\\_\\#\\-]*')}(?:$|[\\s\\*\\_\\#\\-]+)`,
    )
    .join('|');

  const copyPhrasePattern = copyPhrases
    .map(
      (p) =>
        `(?:^|[\\s\\*\\_\\#\\-]+)${p.replace(/ /g, '[\\s\\*\\_\\#\\-]*')}(?:$|[\\s\\*\\_\\#\\-]+)`,
    )
    .join('|');

  const regex = new RegExp(phrasePattern, 'gim');
  const copyRegex = new RegExp(copyPhrasePattern, 'gim');

  cleaned = cleaned.replace(regex, '\n');
  cleaned = cleaned.replace(copyRegex, '\n');

  // Remove empty lines created by the process
  cleaned = cleaned.replace(/^\s*[\r\n]/gm, '');

  return cleaned;
}

export function processMultiLineLinks(markdownContent: string): string {
  let insideLinkContent = false;
  let newMarkdownContent = '';
  let linkOpenCount = 0;
  for (let i = 0; i < markdownContent.length; i++) {
    const char = markdownContent[i];
    if (char === '[') {
      linkOpenCount++;
    } else if (char === ']') {
      linkOpenCount = Math.max(0, linkOpenCount - 1);
    }
    insideLinkContent = linkOpenCount > 0;
    if (insideLinkContent && char === '\n') {
      newMarkdownContent += '\\' + '\n';
    } else {
      newMarkdownContent += char;
    }
  }
  return newMarkdownContent;
}

export function fixCodeBlockFormatting(markdown: string): string {
  // Common programming language identifiers
  const langPattern =
    'ts|tsx|js|jsx|typescript|javascript|python|py|java|c|cpp|csharp|cs|go|rust|ruby|php|html|css|scss|sass|less|json|xml|yaml|yml|bash|sh|shell|zsh|sql|swift|kotlin|dart|r|scala|perl|powershell|ps1|graphql|markdown|md|toml|ini|dockerfile|vue|svelte|astro|hcl|terraform|lua|elixir|elm|haskell|ocaml|fsharp|clojure|groovy|console|diff|text';

  // Create a pattern that matches both standalone language identifiers and file paths with extensions
  const filePathPattern = `(?:(?:[\\w\\-./]+\\.)?)(${langPattern})(?:\\b|$)`;

  let result = markdown;
  // Case 1: Handle standalone language identifiers on their own line before a code block
  result = result.replace(
    new RegExp(`^(${langPattern})\\n\`\`\`\\n`, 'gm'),
    '```$1\n',
  );

  // Case 2: Handle language identifiers in paragraph format
  result = result.replace(
    new RegExp(`^(${langPattern})\\n\\n\`\`\`\\n`, 'gm'),
    '```$1\n',
  );

  // Case 3: Handle file paths on their own line before a code block
  result = result.replace(
    new RegExp(`^${filePathPattern}\\n\`\`\`\\n`, 'gm'),
    (match, lang) => `\`\`\`${lang}\n`,
  );

  // Case 4: Handle file paths in paragraph format
  result = result.replace(
    new RegExp(`^${filePathPattern}\\n\\n\`\`\`\\n`, 'gm'),
    (match, lang) => `\`\`\`${lang}\n`,
  );

  // Case 5: Handle file paths immediately followed by a code block (no newline)
  result = result.replace(
    new RegExp(`^${filePathPattern}\\s*\`\`\`\\n`, 'gm'),
    (match, lang) => `\`\`\`${lang}\n`,
  );

  return result;
}

// Create custom translators to override the default behavior
const preCodeTranslators: TranslatorConfigObject = {
  // Override PRE tag handling
  pre: {
    preserveWhitespace: false, // Disable default whitespace preservation
    // The actual processing happens in the code translator
  },

  // Override CODE tag handling with Turndown-like approach
  code: ({ node, parent, options: { codeFence, codeBlockStyle }, visitor }) => {
    // Check if this is a code block (inside PRE) or inline code
    const hasSiblings = node.previousSibling || node.nextSibling;
    const isCodeBlock = parent?.tagName === 'PRE' && !hasSiblings;

    if (!isCodeBlock) {
      // Handle inline code similar to Turndown
      return {
        noEscape: true,
        postprocess: ({ content }) => {
          if (!content) return '';

          // Replace newlines with spaces like Turndown does
          const processedContent = content.replace(/\r?\n|\r/g, ' ');

          // Add extra space if needed (Turndown approach)
          const extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? ' ' : '';

          // Determine delimiter (add more backticks if content contains backticks)
          let delimiterStr = '`';
          const matches = processedContent.match(/`+/gm) || [];
          for (const match of matches) {
            if (match === delimiterStr) {
              delimiterStr += '`';
            }
          }

          return (
            delimiterStr +
            extraSpace +
            processedContent +
            extraSpace +
            delimiterStr
          );
        },
      };
    }

    // Handle code blocks like Turndown
    if (codeBlockStyle === 'fenced') {
      const className = node.getAttribute('class') || '';
      const language = (className.match(/language-(\S+)/) || [null, ''])[1];

      return {
        noEscape: true,
        preserveWhitespace: false, // Important: don't use NHM's whitespace preservation
        postprocess: ({ content }) => {
          // Get the raw text directly from the node
          const codeText = node.textContent || '';

          // Create fence (similar to Turndown)
          const fenceChar = codeFence.charAt(0);
          let fenceSize = 3;

          // Increase fence size if code contains fence-like sequences
          const fenceRegex = new RegExp(`^${fenceChar}{3,}`, 'gm');
          // biome-ignore lint/suspicious/noImplicitAnyLet: false positive
          let match;
          // biome-ignore lint/suspicious/noAssignInExpressions: false positive
          while ((match = fenceRegex.exec(codeText))) {
            if (match[0].length >= fenceSize) {
              fenceSize = match[0].length + 1;
            }
          }

          const fence = fenceChar.repeat(fenceSize);

          // Return the formatted code block
          return `${fence + language}\n${codeText.replace(/\n$/, '')}\n${fence}`;
        },
      };
    } else {
      // Indented code block style
      return {
        noEscape: true,
        preserveWhitespace: false,
        postprocess: ({ node }) => {
          // Get raw text content directly
          const codeText = node.textContent || '';

          // Indent each line with 4 spaces
          return codeText
            .split('\n')
            .map((line) => `    ${line}`)
            .join('\n');
        },
      };
    }
  },
};

export const nhmTranslators: TranslatorConfigObject = {
  ...preCodeTranslators,
};

export const nhmCustomTranslators: TranslatorConfigObject = {};
