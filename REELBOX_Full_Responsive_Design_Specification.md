# REELBOX — Full Responsive Design & Mobile Experience Specification

## 1. Purpose

This document defines the responsive-design standard for REELBOX across phones, tablets, laptops, desktops, large displays, touch devices, keyboards, and installed PWA environments.

Responsiveness is a product requirement, not a final CSS pass. Every user-facing and admin feature must have intentional behavior at different viewport sizes.

The implementation should use flexible layouts, responsive images, fluid typography, appropriate interaction patterns, accessibility, and support for mouse, keyboard, and touch input. These are established areas of modern responsive web design guidance. [1][2]

---

## 2. Core Principles

### 2.1 Mobile-first

REELBOX must be designed mobile-first and work from approximately 320px wide upward.

Required phone testing widths include:

- 320px
- 360px
- 375px
- 390px
- 393px
- 414px
- 430px

There must be no accidental page-level horizontal scrolling.

### 2.2 Responsive means behavioral adaptation

Do not simply shrink desktop components.

Components may change behavior:

**Desktop**
- Full navigation
- Multi-column layouts
- Sidebars
- Persistent episode panels
- Expanded metadata

**Mobile**
- Bottom navigation
- Compact header
- Bottom sheets
- Stacked details
- Horizontal content rails
- Full-width player

### 2.3 Flexible layout system

Use:

- CSS Grid
- Flexbox
- `minmax()`
- `clamp()`
- relative units
- container queries where useful
- responsive images
- intrinsic sizing

Media queries should represent meaningful layout changes rather than every possible device width.

### 2.4 No accidental overflow

Prevent overflow caused by:

- fixed-width cards
- oversized images
- long titles
- navigation
- player controls
- filters
- modals
- long URLs
- tables
- unwrapped metadata

Intentional horizontal scrolling is allowed inside content rails and similar components.

---

# 3. Responsive Breakpoint Model

Breakpoints are implementation guidance, not rigid device categories.

## 3.1 Compact mobile — 320–359px

Priorities:

- No overflow
- Readable typography
- Essential controls remain visible
- Reduced decorative spacing
- Comfortable touch interaction
- Secondary actions can move into overflow menus

## 3.2 Standard mobile — 360–479px

Primary phone experience:

- Bottom navigation
- Compact header
- 2-column poster grid where card dimensions permit
- Horizontal content rails
- Full-width video player
- Stacked metadata
- Touch-friendly controls
- Bottom sheets for filters and selections

## 3.3 Large mobile — 480–767px

Allow:

- Wider cards
- 2–4 column grids where appropriate
- Larger hero areas
- More metadata
- Expanded search controls

## 3.4 Tablet — 768–1023px

Allow:

- Expanded navigation
- 3–5 column content grids depending on card size
- Two-column details
- Wider player
- Richer filters
- Compact sidebar where useful

## 3.5 Desktop — 1024–1439px

Provide:

- Full navigation
- Multi-column grids
- Wide player layouts
- Side content
- Expanded metadata
- Hover and focus interactions

## 3.6 Large desktop — 1440px+

Do not stretch the application indefinitely.

Use a maximum content width and increase whitespace and grid density rather than making every element excessively wide.

## 3.7 Ultra-wide — 1920px+

Maintain visual balance.

Avoid:

- Extremely wide text lines
- Huge cards
- Stretched players
- Excessive empty space

---

# 4. Global Layout

## 4.1 Content container

Use a consistent responsive container:

```css
.container {
  width: min(100% - 2 * var(--page-gutter), var(--content-max));
  margin-inline: auto;
}
```

The exact implementation may differ, but the behavior must remain consistent.

## 4.2 Responsive gutters

Suggested baseline:

| Width | Gutter |
|---|---:|
| 320–359px | 16px |
| 360–479px | 16–20px |
| 480–767px | 20–24px |
| 768–1023px | 24–32px |
| 1024–1439px | 32–48px |
| 1440px+ | 48px+ as appropriate |

All values should be tokenized.

## 4.3 Safe areas

Support devices with display cutouts and gesture navigation.

Bottom navigation, player controls, sheets, and fixed actions must account for safe-area insets.

---

# 5. Navigation

## 5.1 Mobile navigation

Recommended primary navigation:

- Home
- Live
- Search
- My List
- Profile

Requirements:

- Comfortable touch targets
- Clear active state
- Accessible labels
- Safe-area support
- No content obstruction
- No reliance on hover

## 5.2 Mobile header

Prioritize:

1. REELBOX branding
2. Essential navigation/action
3. Search/profile when appropriate

Avoid overcrowding.

Long navigation menus should use a drawer or sheet.

## 5.3 Desktop navigation

May use:

- Top navigation
- Sidebar
- Hybrid navigation

depending on the page.

## 5.4 Navigation state

Navigation should preserve:

- Active section
- Relevant search state
- Playback state
- Appropriate scroll position

Avoid unnecessary full-page reloads.

---

# 6. Home Page

## 6.1 Hero

### Mobile

- Shorter hero
- Controlled artwork height
- Readable title
- Limited description
- Primary CTA
- Optional secondary action
- Strong readability overlay

### Desktop

- Larger cinematic hero
- More artwork
- Expanded metadata
- Larger CTA group

The hero must not push useful content excessively far below the fold.

## 6.2 Content rails

Examples:

- Continue Watching
- Trending
- Popular Movies
- New Releases
- Recommended
- Live Channels
- Series
- Recently Added

Mobile rails may horizontally scroll.

Requirements:

- No page-level horizontal overflow
- Consistent card width
- Clear continuation cue
- Touch scrolling
- Keyboard accessibility

## 6.3 Section headings

Mobile headings should remain compact:

```text
Trending                         See all →
```

---

# 7. Movie Cards

Cards must adapt rather than use fixed desktop dimensions.

Supported information:

- Poster
- Title
- Year
- Type
- Rating where available
- Progress
- Live status where applicable
- Play action
- Focus/hover state

### Mobile

Prioritize:

1. Artwork
2. Title
3. Essential metadata
4. Progress/status

### Desktop

Additional metadata can appear through expanded layouts or hover/focus states.

Use responsive grid sizing such as:

```css
grid-template-columns:
  repeat(auto-fit, minmax(min(100%, 150px), 1fr));
```

or an equivalent system appropriate to the card design.

---

# 8. Series, Seasons & Episodes

Series are a first-class REELBOX content type.

Structure:

```text
Series
 ├── Season 1
 │    ├── Episode 1
 │    ├── Episode 2
 │    └── Episode 3
 └── Season 2
      ├── Episode 1
      └── Episode 2
```

## 8.1 Series detail

### Desktop

```text
Artwork | Title
         Metadata
         Description
         Actions

Season selector | Episode list
                | Episode 1
                | Episode 2
                | Episode 3
```

### Mobile

```text
Artwork
Title
Metadata
Description
Actions

Season 1 ▼

Episode 1
Episode 2
Episode 3
```

## 8.2 Season selector

Mobile:

- Select control
- Bottom sheet
- Compact dropdown

Desktop:

- Tabs
- Dropdown
- Sidebar selector

## 8.3 Episode cards

Prioritize:

- Episode number
- Thumbnail
- Title
- Duration
- Watched/progress state
- Play action

Descriptions may collapse on mobile.

---

# 9. Video Player

The player is a critical responsive component.

## 9.1 General

Use a stable aspect-ratio container where appropriate.

Avoid arbitrary fixed heights that break across devices.

## 9.2 Mobile player

Must:

- Use available width
- Keep controls accessible
- Support fullscreen
- Support landscape playback
- Respect safe areas
- Work with touch
- Avoid clipped controls

Do not make controls unusably small.

## 9.3 Desktop player

May provide:

- Wide player
- Expanded control bar
- Playback speed
- Quality selection
- Captions
- Fullscreen
- Picture-in-picture where supported
- Volume control
- Seek bar

Only expose controls supported by the active source.

## 9.4 Landscape mobile

On rotation:

- Player should use available viewport
- Unnecessary surrounding UI may collapse
- Controls remain usable
- Playback state must survive orientation changes

---

# 10. Live TV

Live TV has different responsive behavior from VOD.

## Mobile

```text
Live TV

[ Search ]

News | Sports | Kids | Movies

Channel cards
Channel cards
Channel cards

Now Playing
```

Channel cards may show:

- Logo
- Name
- Category/country
- LIVE indicator
- Current programme when EPG data exists

## Desktop

Can provide:

- Channel grid
- Category sidebar
- Current programme
- EPG panel
- Larger preview/player

---

# 11. EPG / TV Guide

EPG is information-dense and requires a dedicated mobile presentation.

## Mobile

Do not force a desktop timeline onto a phone.

Use:

- Channel selector
- Current programme
- Vertical programme list
- Horizontal time strip where useful

Example:

```text
Channel

NOW
12:00 — Programme A
13:00 — Programme B
14:00 — Programme C
```

## Tablet/Desktop

Use richer timeline/timetable layouts.

The page itself must not require uncontrolled horizontal scrolling.

---

# 12. Search

## Mobile

Search should:

- Open quickly
- Keep the keyboard usable
- Preserve entered text
- Update results efficiently
- Provide filters through a sheet
- Use compact result cards

## Desktop

May include:

- Wide search field
- Category filters
- Sorting
- Rich result cards

Search results must distinguish:

- Live Channel
- Movie
- Series
- Episode

---

# 13. Filters and Sorting

### Mobile

Use:

```text
[ Filter ] [ Sort ]
```

Opening these controls should use a bottom sheet or compact full-screen panel.

### Desktop

Filters may remain visible:

```text
Category
Genre
Country
Year
Type
Language
```

Do not create oversized mobile filter panels.

---

# 14. Content Detail Pages

## Mobile order

1. Artwork
2. Title
3. Primary action
4. Metadata
5. Description
6. Secondary actions
7. Cast/details
8. Related content

## Desktop

Use a two-column presentation where the available width supports it.

When the content becomes too narrow, stack it.

---

# 15. Authentication

Login, registration, and password reset must work at very small widths.

Requirements:

- Full-width inputs within safe gutters
- Readable labels
- Correct mobile keyboard types
- Password visibility controls
- Clear validation
- No clipped errors
- Visible focus states

Desktop may use a centered constrained form.

---

# 16. My List, History & Continue Watching

### Mobile

Use compact list items containing:

- Thumbnail/poster
- Title
- Type
- Progress
- Status
- Overflow actions

### Desktop

May offer:

- Grid/list toggle
- Larger metadata
- Expanded actions

Continue Watching must prioritize quick resume.

---

# 17. Profile & Settings

### Mobile

Use a list structure:

```text
Profile
Account
Playback
Appearance
Notifications
Privacy
Security
About
```

### Desktop

Use:

```text
Sidebar | Settings Content
```

Do not force a large desktop settings form into a narrow phone layout.

---

# 18. Forms

Every form must be responsive.

Requirements:

- Inputs cannot exceed their parent
- Labels wrap naturally
- Error messages cannot overflow
- Buttons remain usable
- Mobile keyboard does not hide critical actions
- Focus states remain visible
- Correct input/autocomplete types

Long forms should be divided into logical sections.

---

# 19. Modals, Drawers & Sheets

### Desktop

Use centered constrained modals where appropriate.

### Mobile

Prefer:

- Bottom sheets
- Full-screen sheets
- Compact dialogs

Sheets must:

- Respect safe areas
- Have a clear close action
- Scroll internally when needed
- Prevent unintended background interaction
- Preserve user context

---

# 20. Notifications

Toasts and notifications must never cover:

- Player controls
- Bottom navigation
- Essential CTAs
- Gesture/safe-area regions

Mobile notifications can appear above bottom navigation.

Desktop notifications can appear in a screen corner.

---

# 21. Typography

Typography must scale intentionally.

Use fluid sizing where appropriate:

```css
font-size: clamp(min, fluid, max);
```

Requirements:

- Headlines wrap naturally
- Long titles do not break layouts
- Text remains readable at 320px
- Intermediate widths do not create awkward jumps
- Line lengths remain comfortable on large screens

---

# 22. Spacing

Use centralized spacing tokens.

Mobile should not simply receive tiny versions of desktop spacing.

The goal is:

- Dense enough for discovery
- Comfortable enough for touch
- Spacious enough on desktop
- Balanced on large screens

---

# 23. Responsive Images

Content imagery must be optimized.

Use:

- Appropriate dimensions
- `srcset`
- `sizes`
- Lazy loading where appropriate
- WebP/AVIF where appropriate
- Explicit aspect ratios/dimensions
- Proper placeholders

Do not load unnecessarily large desktop posters on mobile.

Responsive image techniques are a standard part of modern responsive development. [3]

---

# 24. Loading States

Every major component needs a responsive loading state.

Examples:

- Poster skeleton
- Title skeleton
- Metadata skeleton
- Player loading
- EPG loading
- Search loading
- Episode loading

Skeleton dimensions should match the final component at that viewport to minimize layout shift.

---

# 25. Empty States

Responsive empty states are required for:

- No search results
- Empty My List
- Empty history
- No channels
- No episodes
- No recommendations

Mobile empty states should avoid oversized illustrations that push useful messaging below the fold.

---

# 26. Error States

Responsive errors must clearly communicate:

- What happened
- Whether retry is available
- What the user can do

Examples:

- Stream unavailable
- Source timeout
- Unsupported playback
- EPG unavailable
- API unavailable
- Authentication failure

Errors must not break surrounding layout.

---

# 27. Touch Interaction

REELBOX is touch-first on mobile.

Avoid tiny controls for:

- Close
- Menu
- Episodes
- Filters
- Player controls
- Pagination

Essential actions must never depend on hover.

Hover is enhancement only, never a requirement.

---

# 28. Gesture Behavior

Potentially support:

- Horizontal rail scrolling
- Swipeable sheets
- Native page scrolling
- Player seeking where appropriate

Gestures must not conflict with browser navigation or make features undiscoverable.

---

# 29. Keyboard Accessibility

Responsive behavior must also work for keyboard users.

Requirements:

- Visible focus
- Logical tab order
- Keyboard-accessible menus
- Keyboard-accessible dialogs
- Keyboard-accessible carousels
- No keyboard traps
- Accessible player controls

---

# 30. Screen Reader Support

Responsive layout must not change semantic meaning.

Use:

- Semantic HTML
- Proper headings
- Correct buttons/links
- Accessible labels
- Appropriate ARIA only where needed
- Status announcements for dynamic changes

Mobile and desktop navigation should expose equivalent functionality.

---

# 31. Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Reduce:

- Large transitions
- Decorative autoplay
- Aggressive card animation
- Parallax
- Excessive motion

Essential functionality must remain available.

---

# 32. Performance

Responsiveness includes performance.

REELBOX must use:

- Route-level code splitting
- Lazy-loaded routes
- Lazy-loaded images
- Optimized poster sizes
- API pagination
- Appropriate caching
- Efficient state updates
- Avoidance of unnecessary re-renders
- Efficient list rendering

Do not load the entire content catalogue on initial page load.

---

# 33. Mobile Network Conditions

REELBOX must remain usable on slower mobile connections.

Requirements:

- Render useful UI before all images finish loading
- Prioritize visible content
- Avoid blocking navigation on non-critical requests
- Retry failed requests sensibly
- Cache safe metadata
- Avoid duplicate requests
- Avoid loading hidden rails unnecessarily

Video should continue to be delivered by the authorized playback source rather than unnecessarily proxied through the application server.

---

# 34. PWA

The installed REELBOX PWA must remain responsive.

Requirements:

- Correct viewport configuration
- Standalone display
- Safe-area support
- Correct icons
- Appropriate manifest metadata
- Mobile and desktop screenshots where applicable
- Graceful offline states

Modern web-app install experiences can use manifest screenshots and descriptions. [4]

---

# 35. Orientation

Support:

- Portrait
- Landscape

Video playback should take advantage of landscape mode.

Other pages should remain usable in portrait.

---

# 36. Device & Browser Testing

At minimum test:

### Mobile

- Chrome Android
- Safari iPhone
- Samsung Internet where practical

### Desktop

- Chrome
- Edge
- Firefox
- Safari where practical

Test both touch and pointer interaction.

---

# 37. Required QA Viewports

| Viewport | Purpose |
|---|---|
| 320×568 | Extreme compact mobile |
| 360×800 | Compact Android |
| 375×812 | iPhone-class |
| 390×844 | Modern phone |
| 414×896 | Large phone |
| 430×932 | Large phone |
| 768×1024 | Tablet |
| 820×1180 | Tablet |
| 1024×768 | Small desktop/tablet |
| 1280×720 | Desktop |
| 1366×768 | Common desktop |
| 1440×900 | Large desktop |
| 1920×1080 | Large desktop |
| 2560×1440 | Ultra-wide |

Also resize continuously between these widths.

---

# 38. Page-by-Page Responsive QA

Every route must be tested.

## Consumer application

- Home
- Live TV
- TV Guide / EPG
- Search
- Movie details
- Series details
- Season view
- Episode view
- Player
- My List
- Watch History
- Continue Watching
- Login
- Registration
- Password Reset
- Profile
- Settings
- Legal pages
- Help/About

## Admin

- Dashboard
- Channel management
- Playlist ingestion
- VOD management
- Series management
- Season management
- Episode management
- EPG
- Source management
- Users
- Audit logs
- Settings

Admin tables may become responsive cards, stacked views, or controlled horizontal table regions. The entire page must not overflow.

---

# 39. Admin Mobile Experience

The admin panel does not need to visually match the consumer interface, but it must remain usable.

Mobile behavior may include:

- Tables → cards
- Row actions → overflow menus
- Filters → bottom sheets
- Forms → single-column
- Destructive actions → explicit confirmation

Do not simply shrink dense desktop tables.

---

# 40. Responsive Design Tokens

Centralize:

- Page gutters
- Maximum content width
- Section spacing
- Card gaps
- Grid gaps
- Radius
- Typography scale
- Navigation height
- Player spacing
- Modal widths
- Bottom-navigation height
- Safe-area offsets

Avoid scattered viewport-specific magic numbers.

---

# 41. Container Queries

Use container queries where a reusable component needs to respond to the width of its own parent rather than the viewport.

Good candidates:

- Movie cards
- Episode cards
- Recommendation widgets
- Player side panels
- Admin cards
- Content rails

---

# 42. Component-Level Responsive Contracts

Every reusable component must define responsive behavior.

Example:

```text
MovieCard
 ├── Mobile
 ├── Tablet
 └── Desktop

EpisodeCard
 ├── Mobile
 ├── Tablet
 └── Desktop

Player
 ├── Mobile Portrait
 ├── Mobile Landscape
 ├── Tablet
 └── Desktop

Navigation
 ├── Mobile
 ├── Tablet
 └── Desktop
```

Responsiveness must not be implemented only at page level.

---

# 43. No "Desktop Shrunk Down" Rule

This is explicitly prohibited:

> Build desktop first, shrink fonts and widths, and call it mobile responsive.

Instead:

```text
Responsive requirement
        ↓
Mobile behavior defined
        ↓
Component built
        ↓
Tablet behavior
        ↓
Desktop behavior
        ↓
Large-screen behavior
        ↓
Touch + keyboard QA
```

---

# 44. Visual Consistency

Across every viewport, maintain:

- REELBOX identity
- Reelbox Red
- Typography
- Icon style
- Card language
- Radius system
- Spacing logic
- Player identity
- Active states
- Content hierarchy

Layout may change. Brand identity must not.

---

# 45. Content Priority

Mobile should not simply remove information. It should prioritize it.

### Highest priority

- Title
- Artwork
- Play/resume
- Content type
- Essential metadata
- Current status

### Secondary

- Description
- Additional metadata
- Cast
- Categories

### Tertiary

- Technical information
- Source information
- Low-priority actions

Secondary and tertiary information may collapse on mobile.

---

# 46. Accessibility & Contrast

REELBOX's dark cinematic interface must maintain readable contrast.

Check:

- Text
- Icons
- Focus indicators
- Disabled states
- Player controls
- Form errors
- Selected states

Accessibility should be built into the component rather than added after implementation. [2]

---

# 47. Responsive Animation

Animations must scale with device capabilities.

Mobile:

- Shorter
- Lighter
- Less computationally expensive

Desktop:

- Richer hover/focus effects where useful

Never allow animation to delay basic navigation.

---

# 48. Testing Procedure

Every release should include:

1. Real-device testing
2. Browser responsive emulation
3. Keyboard navigation
4. Touch interaction
5. Portrait/landscape rotation
6. Slow-network testing
7. Reduced-motion testing
8. Accessibility testing
9. Long-title testing
10. Missing-image testing
11. Empty-state testing
12. API failure testing
13. Player failure testing

---

# 49. Definition of Done

REELBOX is not fully responsive until:

- [ ] 320px remains usable
- [ ] No accidental page-level horizontal overflow
- [ ] Mobile controls are touch-friendly
- [ ] Bottom navigation respects safe areas
- [ ] Player works in portrait and landscape
- [ ] Series/seasons/episodes work on mobile
- [ ] EPG has a dedicated mobile presentation
- [ ] Search and filters work on mobile
- [ ] Cards adapt without clipping
- [ ] Typography remains readable
- [ ] Long titles do not break layouts
- [ ] Modals and sheets adapt correctly
- [ ] Forms work with mobile keyboards
- [ ] Desktop layouts do not stretch excessively
- [ ] Large screens remain balanced
- [ ] Admin works on mobile/tablet
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Reduced-motion preferences are respected
- [ ] Responsive images are used
- [ ] Loading states match component dimensions
- [ ] Error and empty states are responsive
- [ ] PWA installed mode is responsive
- [ ] Real-device testing is completed
- [ ] Intermediate viewport widths are tested
- [ ] Live TV, VOD, Series, EPG, Player and Navigation pass responsive QA

---

# 50. Final Product Standard

REELBOX must feel like a polished streaming application on every supported device.

A phone user must not feel like they are using a compressed desktop website.

A tablet must use its additional space intelligently.

A desktop must provide richer discovery and information density.

A large display must provide cinematic presentation without excessive stretching.

## Final requirement

> **One REELBOX experience, intelligently adapted to every screen, input method, orientation, and usable viewport.**

---

## References

[1] web.dev — Learn Responsive Design  
https://web.dev/learn/design

[2] web.dev — Learn Accessibility  
https://web.dev/learn/accessibility

[3] web.dev — Learn Images / Responsive Images  
https://web.dev/learn/images

[4] web.dev — Richer Install UI for Web Apps  
https://web.dev/articles/web-apps/richer-install-ui
