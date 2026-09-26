export function bindSkipLink({ link, target }) {
  if (!(link instanceof HTMLAnchorElement) || !(target instanceof HTMLElement)) {
    throw new TypeError("Skip link requires an anchor and a focusable target.");
  }

  function moveToContent(event) {
    event.preventDefault();
    target.focus();
  }

  link.addEventListener("click", moveToContent);
  return Object.freeze({
    destroy() { link.removeEventListener("click", moveToContent); },
  });
}
