import tippy, { type Placement } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

// Hover help: a short explanation that appears when the pointer rests on part of the interface.
// Unlike the click-to-edit panels in Tooltip.svelte, help is read-only and gets out of the way:
// it waits before appearing, hides on click, and never captures the mouse.
// Usage: <button use:help={{ text: $t.help.save, placement: 'bottom' }}> (text from i18n/en.ts and its translations)
// Text may contain line breaks ("\n") to separate ideas. Without text, the element has no help.
// Browsers send no mouse events to disabled buttons, so a button that can be disabled needs its help
// on a wrapper: <span class="help-target" use:help={...}><button disabled={...}>...</button></span>

export type Help = { text?: string; placement?: Placement };

export function help(node: HTMLElement, { text, placement = 'top' }: Help) {
  const tooltip = tippy(node, {
    content: text ?? '',
    placement,
    theme: 'light-border help',
    delay: [500, 0],
    maxWidth: 280,
    touch: false,
    appendTo: () => document.body,
  });
  if (!text) tooltip.disable();

  return {
    update({ text, placement = 'top' }: Help) {
      tooltip.setProps({ content: text ?? '', placement });
      if (text) tooltip.enable();
      else tooltip.disable();
    },
    destroy() {
      tooltip.destroy();
    },
  };
}
