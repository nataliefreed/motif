import tippy, {followCursor} from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export function setTooltips() {
  // tippy.setDefaultProps({delay: 50});

  tippy('#joy-preview', {
    content: "Next action",
    theme: 'light-border',
  });

  // tippy(targets, {
  //   followCursor: true,
  //   plugins: [followCursor],
  // });
  
}

