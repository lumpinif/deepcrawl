/**
 * Processes multi-line links in markdown content by escaping newlines within link text.
 * This prevents the markdown parser from breaking links that span multiple lines.
 *
 * @param markdownContent The markdown content to process
 * @returns Processed markdown content with escaped newlines in links
 */
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
      newMarkdownContent += '\\\n';
    } else {
      newMarkdownContent += char;
    }
  }
  return newMarkdownContent;
}

/**
 * Removes "Skip to Content" links from markdown content.
 * These links are typically navigation aids that aren't useful in the markdown output.
 *
 * @param markdownContent The markdown content to process
 * @returns Processed markdown content with skip links removed
 */
export function removeSkipToContentLinks(markdownContent: string): string {
  return markdownContent.replace(/\[Skip to Content\]\(#[^\)]*\)/gi, '');
}
