# Browser regression checks

Start `npm run dev`, then open `/tests/ui-harness.html`. The harness uses simulated media, full-screen state, and an isolated in-memory API. It never contacts the assessment backend or requests a real camera. Vite's production build only includes the main application entry point.

Verify these scenarios:

1. Begin assessment is disabled until a nonblank name, camera, and full-screen checks are complete. Whitespace does not complete the name check.
2. Assessment guide opens, traps keyboard focus, and closes with Escape.
3. Connecting the camera updates both the checklist and preview. Enabling full screen completes setup.
4. Fail next API request shows a retryable error without leaving setup. Retry starts the assessment.
5. The camera preview stays connected after starting, and the browser elapsed timer advances.
6. A saved answer is selected, cannot be changed, and appears as answered in the progress overview. Question navigation preserves it.
7. Fail next API request before an answer leaves that question unanswered; retry saves it.
8. Simulate fullscreen exit shows a restore action. Restore full screen clears the warning.
9. Simulate camera disconnect shows the error and reconnect button. Reconnect camera restores the preview.
10. A failed submission preserves the assessment. A successful submission shows the matching result counts, including unanswered questions.
11. `/tests/ui-harness.html?camera=denied` shows a permission error and keeps assessment start disabled.
12. `/tests/ui-harness.html?questions=empty` shows the empty assessment error without creating a session.
13. Switch between Setup checklist and Guidelines. Returning to the checklist preserves the candidate name and permission state.
14. Privacy & camera opens the dedicated privacy guidance.
15. `/tests/responsive.html` renders the workspace in a 390px frame with stacked content and no horizontal overflow. Check guide, questions, and results in this frame too.

For integration validation, use the main application with the real backend and physical camera. Harness results do not verify Electron IPC or camera hardware.

## Sidebar and motion checks

- At desktop widths, scroll the main page and confirm the sidebar remains anchored with all navigation and resource actions visible. Check a 540px viewport height and use sidebar scrolling on unusually short displays.
- At mobile widths, confirm compact navigation remains sticky without covering the assessment controls.
- Verify the GSAP page entrance runs once per screen, not on timer ticks or while typing. Verify switching questions, setup sections, navigation indicators, button presses, and guide entry animate without shifting the layout.
- `/tests/ui-harness.html?motion=reduced` simulates reduced-motion media queries without changing system settings. Content must remain visible, controls must work, and springs and entrance transforms must be suppressed.
- Confirm the copyright footer, sidebar promotional card, placeholder profile, repeated workspace labels, and duplicate permission captions are absent. Privacy information remains available through Privacy & camera.

## DevClub component checks

- Verify Candy Buttons preserve disabled states, keyboard focus, and action labels. Permission success uses the mint treatment; primary actions use blue and secondary actions use pearl.
- Confirm the Hook Sidebar follows the current assessment stage, its rail remains aligned after resizing, and all sidebar content is visible in a 540px-high desktop viewport.
- Confirm setup and question progress reflect saved state and cannot be edited by dragging the progress segments.
- Confirm rounded panels and controls retain solid backgrounds. Check the setup-tab underline remains within its active button when switching tabs or scrolling.
- Check the reduced-motion fixture, desktop flow, mobile flow, API error states, and guide keyboard dismissal after component changes.

## Workspace navigation regression

The harness runs `navigation-regression.js` against the rendered sidebar. Its status is shown above the app: all three destinations must be native buttons, have visible labels and button types, and announce exactly one current page. This check reproduced the missing-control failure before the fix.

1. Before starting, click Assessment and Results; both must open their appropriate setup/empty states. Return to Setup using the sidebar or state action.
2. Start a session, save an answer, and note the elapsed time. Visit Setup, then Results, then Assessment. The saved selection, question index, connected preview, and continuously advancing timer must remain intact.
3. Candidate name is read-only during a session. Return to assessment from Setup must resume, without creating a new session.
4. Submit, then visit Assessment and Setup. Assessment shows completion; Setup shows released camera state and links to Results. These routes must not restart the test or allow more answers.
5. Activate all three navigation buttons with Enter and Space. Verify matching click-area sizes and sticky alignment at desktop and mobile widths.
