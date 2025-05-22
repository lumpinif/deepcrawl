/**
 * Handles both inclusion and exclusion of HTML tags
 * Matches includeTags and excludeTags functionality
 */
export class TagFilterHandler implements HTMLRewriterElementContentHandlers {
  constructor(
    private readonly includeTags?: string[],
    private readonly excludeTags?: string[],
  ) {}

  element(element: Element) {
    const tagName = element.tagName.toLowerCase();

    // If includeTags is specified, remove everything not in the list
    if (this.includeTags?.length) {
      if (!this.includeTags.includes(tagName)) {
        element.remove();
      }
      return;
    }

    // If excludeTags is specified, remove matching tags
    if (this.excludeTags?.length) {
      // Handle wildcard patterns
      const shouldRemove = this.excludeTags.some((pattern) => {
        if (pattern.startsWith('*') && pattern.endsWith('*')) {
          const regex = new RegExp(pattern.slice(1, -1), 'i');
          // Check tag name
          if (regex.test(tagName)) return true;

          // Special handling for class matches if pattern starts with *
          if (pattern.startsWith('*.')) {
            const classes = element.getAttribute('class')?.split(/\s+/) || [];
            return classes.some((cls) => regex.test(cls));
          }

          // Check common attributes that might match the pattern
          const commonAttrs = ['id', 'class', 'role', 'type', 'name'];
          for (const attr of commonAttrs) {
            const value = element.getAttribute(attr);
            if (value && regex.test(`${attr}="${value}"`)) {
              return true;
            }
          }

          return false;
        }
        return pattern === tagName;
      });

      if (shouldRemove) {
        element.remove();
      }
    }
  }
}
