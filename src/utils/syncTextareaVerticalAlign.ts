/** Centra el texto verticalmente cuando el contenido es más bajo que el textarea. */
export function syncTextareaVerticalAlign(textarea: HTMLTextAreaElement): void {
  const computed = getComputedStyle(textarea);
  const minHeight = textarea.offsetHeight;
  const basePaddingY = parseFloat(computed.paddingTop) || 8;
  const borderY =
    parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
  const innerHeight = minHeight - borderY;

  textarea.style.paddingTop = '0px';
  textarea.style.paddingBottom = '0px';

  const contentHeight = textarea.scrollHeight;

  if (contentHeight < innerHeight) {
    const pad = (innerHeight - contentHeight) / 2;
    textarea.style.paddingTop = `${pad}px`;
    textarea.style.paddingBottom = `${pad}px`;
    return;
  }

  textarea.style.paddingTop = `${basePaddingY}px`;
  textarea.style.paddingBottom = `${basePaddingY}px`;
}
