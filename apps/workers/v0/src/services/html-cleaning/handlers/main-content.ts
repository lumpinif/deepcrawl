import { excludeNonMainTags } from '../selectors';

/**
 * Handles main content extraction
 * Removes common non-content elements like headers, footers, navigation, etc.
 */
export class MainContentHandler implements HTMLRewriterElementContentHandlers {
  private readonly excludePatterns: Array<{
    tag?: string;
    class?: string;
    id?: string;
    attr?: { name: string; value?: string };
  }>;

  constructor() {
    // Convert excludeNonMainTags into structured patterns
    this.excludePatterns = excludeNonMainTags.map((selector) => {
      if (selector.startsWith('.')) {
        return { class: selector.slice(1) };
      }
      if (selector.startsWith('#')) {
        return { id: selector.slice(1) };
      }
      if (selector.startsWith('[')) {
        const match = selector.match(/\[(.*?)(?:=['"](.*)['"])?\]/);
        if (match) {
          const [, name, value] = match;
          return { attr: { name, value } };
        }
      }
      return { tag: selector };
    });
  }

  element(element: Element) {
    const tagName = element.tagName.toLowerCase();
    const classNames = element.getAttribute('class')?.split(/\s+/) || [];
    const id = element.getAttribute('id');

    // Check if element matches any exclude pattern
    const shouldRemove = this.excludePatterns.some((pattern) => {
      if (pattern.tag && pattern.tag === tagName) {
        return true;
      }
      if (pattern.class && classNames.includes(pattern.class)) {
        return true;
      }
      if (pattern.id && id === pattern.id) {
        return true;
      }
      if (pattern.attr) {
        const { name, value } = pattern.attr;
        const attrValue = element.getAttribute(name);
        return value ? attrValue === value : attrValue !== null;
      }
      return false;
    });

    if (shouldRemove) {
      element.remove();
    }
  }
}
