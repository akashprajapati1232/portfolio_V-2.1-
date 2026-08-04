# J.A.R.V.I.S Panel and Layout Controls Implementation

## Overview
Recreate the layout-controls section to match the screenshot exactly (remove split editor button), make all layout toggles functional (left sidebar, terminal panel, right sidebar), and add a J.A.R.V.I.S AI assistant panel on the right side.

## Proposed Changes

### `index.html`
- [MODIFY] Remove the fourth "Split Editor Right" layout button.
- [MODIFY] Add `#right-sidebar` and `#right-activity-bar` inside `#main-layout` (after `#editor-container`).
- [NEW] Structure the J.A.R.V.I.S panel within `#right-sidebar` (chat history container, input area).

### `css/style.css` & `css/sidebar.css`
- [MODIFY] Add CSS rules for `#right-sidebar` and `#right-activity-bar` mirroring the left side.
- [MODIFY] Add CSS transitions to panels (`#sidebar`, `#right-sidebar`, `#terminal-panel`) to ensure smooth open/close animations.
- [MODIFY] Add styling for `.layout-btn:not(.active) .fill-part { display: none; }` to handle visual toggling of the layout icons perfectly.
- [NEW] Add J.A.R.V.I.S chat interface styling.

### `js/app.js`
- [MODIFY] Add event listeners for `#layout-left`, `#layout-bottom`, `#layout-right` buttons.
- [MODIFY] Implement toggle functions that add/remove `.hidden` or `.collapsed` classes to the respective panels and `.active` classes to the buttons.
- [MODIFY] Implement logic for the `#act-jarvis` icon to open the J.A.R.V.I.S panel.

## Verification Plan
1. Check that the right-side layout buttons look exactly like the screenshot and visually toggle blue fill when clicked.
2. Verify that clicking the buttons smoothly hides/shows the Left Sidebar, Terminal, and Right Sidebar.
3. Verify that the J.A.R.V.I.S panel is on the right and looks like an authentic VS Code AI side panel.
