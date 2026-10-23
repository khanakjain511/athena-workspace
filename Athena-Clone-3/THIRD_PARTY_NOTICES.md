# DevClub UI components

The local components in `src/components/devclub/` adapt the corresponding source from `@devclubnst/ui` version 2.1.3, published by DevClub under the MIT license. The original license is retained in [public/devclub-ui-LICENSE.txt](public/devclub-ui-LICENSE.txt) and included in the production build.

| Local component | Original component | Adaptations |
| --- | --- | --- |
| `CandyButton.jsx` | [Candy Button](https://ui.devclubxnst.com/components/candy-button) | Solid colours, existing Framer Motion feedback, local CSS, native button semantics, and application-specific variants. |
| `HookSidebar.jsx` | [Hook Sidebar](https://ui.devclubxnst.com/components/hook-sidebar) | Controlled workspace navigation with native buttons, local icons, solid curved rail, ResizeObserver cleanup, and no Next.js routing dependency. |
| `SegmentedProgress.jsx` | [Segmented Progress](https://ui.devclubxnst.com/components/segmented-progress) | Display-only assessment progress, scoped GSAP segment animation, reduced-motion support, and the application's light palette. |

Upstream sources were inspected from the published npm archive and component documentation. These adaptations use the existing React, Framer Motion, GSAP, and CSS stack. They do not require the DevClub CLI at runtime.
