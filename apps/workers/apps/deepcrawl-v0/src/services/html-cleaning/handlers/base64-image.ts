/**
 * Removes base64 encoded images from the HTML content
 * Matches removeBase64Images functionality
 */
export class Base64ImageHandler implements HTMLRewriterElementContentHandlers {
  element(element: Element) {
    const src = element.getAttribute('src');
    if (src?.startsWith('data:image')) {
      element.remove();
    }
  }
}
