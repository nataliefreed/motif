import { tick } from 'svelte';

// Scales an element's content down just enough to fit the element's width, and leaves it alone
// when it already fits. For a row whose content can outgrow its space, like the tool buttons,
// whose labels are longer in some languages.
// Usage: <div use:shrinkToFit={[...what the content depends on]}><Row/></div>

export function shrinkToFit(node: HTMLElement, _contentDependsOn?: unknown) {
  function fit() {
    const content = node.firstElementChild as HTMLElement | null;
    if (!content) return;
    const scale = Math.min(1, node.clientWidth / content.scrollWidth);
    content.style.transformOrigin = 'left center';
    content.style.transform = scale < 1 ? `scale(${scale})` : '';
  }

  const resized = new ResizeObserver(fit);
  resized.observe(node);
  tick().then(fit);

  return {
    update() { tick().then(fit); }, // after the content has re-rendered
    destroy() { resized.disconnect(); },
  };
}
