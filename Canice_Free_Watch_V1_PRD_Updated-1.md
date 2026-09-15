# CANICE FREE WATCH
UPDATED V1 PRODUCT REQUIREMENTS DOCUMENT
Private Hybrid Live TV + On-Demand Streaming Web Application
Version 1.0 • September 2026
## 1. Product Overview
Canice Free Watch is a private, invite-only streaming web application designed to provide a premium, Netflix-inspired viewing experience while combining two distinct content models: cable-TV-style live streaming and a standalone on-demand video library.
The product is not a Netflix-content integration and does not claim ownership of third-party content. Netflix is a UX inspiration only. The application organizes and presents permitted content sources through one clean interface.
- Live TV: live channels sourced primarily from IPTV-org.
- On-Demand: standalone movies, series and other videos from separate authorized/free VOD sources.
- Metadata: TMDB may be used for catalogue metadata, artwork and TV/movie information; it is not the playback source.
- Hosting: existing Hostinger Premium Web Hosting.
- Architecture: React + Vite frontend, PHP API/backend, MySQL database and PWA capabilities.
- Access: private/invite-only by default, with Admin and User roles.
### Core experience
Open → Browse → Choose → Watch. Users should not need to understand M3U playlists, stream URLs, EPG files or source infrastructure.
## 2. Product Goals
- Turn large IPTV playlists into a clean, searchable and personalized live-TV experience.
- Provide a first-class on-demand Movies and Series experience alongside Live TV.
- Keep playback inside the Canice Free Watch web app without making Hostinger the video-delivery server.
- Provide an EPG/TV Guide comparable to a modern cable-TV interface.
- Provide accounts, favorites, watch history and cross-device personalization.
- Make the site installable as a PWA and usable comfortably on mobile.
- Provide a dedicated administrative system for users, content, playlist, EPG, VOD sources and system operations.
- Maintain clear copyright, privacy, acceptable-use and third-party-source boundaries.
## 3. Content Architecture
### 3.1 Live TV
The primary live-TV source is the IPTV-org main playlist:
https://iptv-org.github.io/iptv/index.m3u
- The backend periodically retrieves and parses the playlist.
- The app stores normalized channel metadata and stream references.
- The browser player requests playable streams directly from their permitted third-party source where technically supported.
- Hostinger should not proxy the primary video stream by default.
- The app must not bypass DRM, authentication, paywalls, geo-blocks or other access controls.
- Individual streams may be unavailable, geo-restricted, unsupported, offline or affected by CORS/browser limitations; the UI must handle these failures gracefully.
### 3.2 On-Demand Movies
Movies are a separate content type from live movie channels. The VOD architecture must support individual videos that a user can select and watch at any time.
- Initial VOD source: Internet Archive, limited to content that is legally available for the intended use.
- Future VOD providers/sources can be added through a provider/source abstraction.
- Each VOD item can have title, synopsis, poster, backdrop, year, genre, runtime, source, playback URL/file reference and availability status.
- VOD playback remains inside the Canice Free Watch player where technically supported.
### 3.3 On-Demand Series
Series are a first-class content type and must support category/genre browsing plus hierarchical seasons and episodes where source metadata provides them.
- Series categories can include Action, Comedy, Drama, Crime, Thriller, Sci-Fi, Documentary, Animation, Kids and other dynamic genres.
- Series → Show → Seasons → Episodes.
- Episode metadata should include title, synopsis, episode number, season number, duration and playback source where available.
- Continue Watching should resume an episode from the user's stored position.
- Where supported, the player can offer Next Episode.
- The source must legally permit access/playback; the system must not source unauthorized copies.
### 3.4 Metadata
TMDB may serve as the metadata/discovery layer for supported movies and TV series. It can provide posters, backdrops, genres, release years, descriptions, cast and season/episode information. TMDB is not the actual video-stream provider.
- Metadata should be associated with an actual playable/authorized source before an item is presented as watchable.
- The implementation must comply with the applicable TMDB terms, API requirements and attribution requirements.
### 3.5 EPG
EPG (Electronic Program Guide) applies primarily to live channels and provides Now Playing, Next and scheduled programming information. It is separate from VOD episode metadata.
## 4. Source and Playback Model
### 4.1 Live playback architecture
When a user selects a live channel, the application opens its own in-app player. The player uses the channel's source stream URL. The browser receives video data directly from the third-party stream source instead of routing the video through Hostinger.
- User → Canice Free Watch UI → Canice API for channel/configuration → browser player → permitted third-party live stream.
- Hostinger serves the application, APIs and metadata—not the primary live video bandwidth.
- HLS.js should be used where required for HLS playback and browser compatibility.
- Support play/pause, volume, fullscreen, Picture-in-Picture, loading state, retry and error state.
- Where supported, expose a Live indicator and Go Live control.
- Provide an Open Source fallback only where appropriate and where the source permits it.
### 4.2 VOD playback architecture
VOD follows the same principle: the web application owns the player experience while the actual authorized video may be delivered from the VOD provider/source rather than Hostinger.
- User → Canice Free Watch VOD page → in-app player → authorized VOD source.
- Do not download, mirror or proxy arbitrary copyrighted videos through Hostinger.
- Offline video downloads are not part of the default V1. If a future provider explicitly permits downloads, that feature must be implemented only within the provider's rights and technical constraints.
## 5. Information Architecture
- Home
- Live TV
- TV Guide / EPG
- Movies
- Series
- Sports
- News
- Browse
- My List
- Search
- Profile
### Mobile bottom navigation
- Home
- Live TV
- Search
- My List
- Profile
## 6. Home Experience
The Home page should combine live and on-demand discovery without confusing the two content models.
- Hero feature.
- Live Now.
- TV Guide / Now Playing.
- Continue Watching — primarily VOD items with resume position.
- My List.
- Popular.
- Recommended For You.
- Movies.
- Series.
- Sports.
- News.
- Entertainment.
- Music.
- Kids.
- Nigerian.
- African.
- International.
Empty categories should be hidden rather than displaying empty UI.
## 7. Live TV Requirements
### Channel cards
- Channel logo.
- Channel name.
- Country/region.
- Language where available.
- Category.
- Current programme.
- Next programme.
- Favorite/My List action.
### Channel details
- Logo, name, country, language and category.
- Current programme and next programme.
- Programme description where available.
- Watch button.
- Add/remove from My List.
- EPG schedule.
### Categories
- Live TV
- News
- Sports
- Movies
- Entertainment
- Music
- Kids
- Documentary
- Lifestyle
- Business
- Educational
- Religious
- Regional
- Other
Categories should be derived from source metadata where possible, with controlled keyword/fallback rules where metadata is incomplete.
## 8. On-Demand Requirements
### Movies
- Browse by genre/category.
- Search by title.
- Filter/sort by genre, year and other available metadata.
- Movie detail page with poster, backdrop, synopsis, year, runtime, genre and available playback source.
- Play, pause, seek, volume, fullscreen and Picture-in-Picture.
- Resume playback.
- Add to My List.
- Related/recommended content.
### Series
- Browse series by category/genre.
- Series detail page.
- Season selector.
- Episode list.
- Episode playback.
- Resume episode position.
- Mark watched state.
- Next Episode where supported.
- Add series to My List.
- Related/recommended series.
## 9. Search and Discovery
Search must cover both live and on-demand content.
- Channel names.
- Movie titles.
- Series titles.
- Episode titles where appropriate.
- Countries.
- Categories/genres.
- Languages.
- Programmes in EPG.
- Search results must clearly identify whether an item is Live, Movie, Series or Episode.
## 10. Accounts and Access
- Invite-based registration.
- Public registration disabled by default.
- Name, email, password and confirm password.
- Optional profile image/display name.
- Login/logout.
- Password reset.
- Secure sessions.
- Admin and User roles.
- Account states: Pending, Active, Suspended, Deleted.
- Registration records acceptance of the current Terms version and acknowledgement of Privacy Policy, including version/timestamp/user ID.
## 11. My List, History and Personalization
### My List
- Users can save channels, movies and series.
- Favorites sync across devices.
### Watch history
- Store live channel viewing sessions.
- Store VOD progress separately or through a unified watch-history model with content-type awareness.
- VOD stores resume position, completion state and last watched episode.
- Live channels use Recently Watched rather than pretending a live stream has a fixed resume timestamp.
### Recommendations
- Use viewing history, favorites, categories, countries, languages, search behavior, frequency and recent activity.
- Recommended For You.
- Because You Watch.
- More Sports.
- More News.
- More Movies.
- More Series.
- Most Watched.
A lightweight deterministic recommendation system is sufficient for V1; an LLM is not required.
## 12. EPG / TV Guide
- Now Playing.
- Next programme.
- Full schedule.
- Programme descriptions.
- Channel schedule.
- Date navigation.
- Programme search.
- Desktop grid: channels × time.
- Mobile: vertical programme schedule.
- EPG refresh/status in admin.
- Graceful handling of missing or stale EPG data.
## 13. PWA and Offline Experience
- Installable Progressive Web App.
- App icon and splash/launch experience.
- Standalone app window.
- Service worker.
- Cached application shell.
- Offline browsing of cached navigation/content metadata.
- Cache relevant channel metadata, logos, categories, favorites, watch history and appropriate EPG data.
- Clearly distinguish app offline mode from live-stream unavailability.
- No arbitrary offline video downloads in V1.
## 14. Casting and Device Features
- Chromecast where browser/device support permits.
- AirPlay where supported.
- Picture-in-Picture.
- Responsive mobile-first interface.
- Cross-device account synchronization.
## 15. Admin Portal
The Admin Portal is a separate operational interface and does not need to imitate the consumer Netflix-style UI.
- Dashboard
- Users
- Invitations
- Channels
- VOD
- VOD Sources
- Categories
- EPG
- Playlist
- System
- Legal
- Settings
- Logout
### Dashboard
- Total users.
- Active/pending/suspended users.
- Channel count.
- VOD item count.
- EPG programme count.
- Active users today.
- Recent users/activity.
- Most watched content.
- Playlist status.
- EPG status.
- VOD source status.
- Audit activity.
### User management
- View/edit user.
- Suspend/reactivate.
- Delete.
- Reset password.
- Force logout.
- Revoke devices/sessions.
- Change role where authorized.
### Invitation system
- Admin enters invitee name/email.
- Generate unique, expiring, single-use invitation token.
- Resend.
- Revoke.
- Create replacement invitation.
### Channel management
- Search/filter.
- Filter by category/country.
- Disable problematic entries.
- View stream status where technically possible.
- Trigger playlist refresh.
- View last playlist update.
### VOD management
- View/search/filter movies and series.
- Manage categories/genres.
- Manage source/provider association.
- Enable/disable unavailable items.
- Refresh metadata where supported.
- View playback/source status.
- Manage seasons and episodes when required.
- Do not use the admin panel to facilitate unauthorized content acquisition.
### EPG management
- View status.
- Last update.
- Refresh.
- Missing EPG data.
- Errors.
### Playlist management
- Configured source URL.
- Last update.
- Total channels.
- Active/unavailable channels.
- Manual refresh.
- Refresh error status.
### Audit log
- User created/suspended/deleted.
- Invitation sent/revoked.
- Password reset.
- Playlist refresh.
- EPG refresh.
- VOD source refresh.
- Settings changes.
- Action, admin, timestamp, target and result.
## 16. Database Model
- users
- invitations
- channels
- vod_sources
- vod_items
- vod_seasons
- vod_episodes
- favorites
- watch_history
- vod_progress
- epg
- user_preferences
- sessions
- audit_logs
- legal_acceptances
The implementation may consolidate tables where technically appropriate, but the data model must preserve the distinction between live channels, VOD movies/series and EPG programmes.
## 17. API / Backend Structure
- api/auth/
- api/users/
- api/channels/
- api/epg/
- api/playlist/
- api/vod/
- api/vod-sources/
- api/admin/
- api/legal/
The PHP backend should authenticate requests, enforce roles, validate inputs, access MySQL through prepared statements and return only the data required by the frontend.
## 18. Security
- HTTPS.
- Secure password hashing.
- Prepared SQL statements.
- Input validation/sanitization.
- Authentication middleware.
- Role-based authorization.
- Secure cookies/tokens.
- Session expiry.
- CSRF protection where applicable.
- Rate limiting for sensitive endpoints.
- XSS protection.
- API validation.
- Secure invitation tokens.
- Admin route protection.
- Audit logging.
- No secrets in frontend source code.
- No DRM, paywall, authentication or geo-block circumvention.
## 19. Legal, Copyright and Privacy
### Required pages
- Copyright & Content Policy.
- Privacy Policy.
- Cookie Policy.
- Terms of Service.
- Optional Acceptable Use Policy.
- Contact / Legal Requests.
### Copyright & third-party content policy
Canice Free Watch is an interface for organizing and accessing available third-party sources. Channel names, logos, programme information, stream links, metadata and other third-party materials may originate from their respective owners. The application does not claim ownership of those materials.
- Rights remain with the respective owners/licensors.
- Provide a contact/takedown/legal request mechanism.
- Do not circumvent DRM, authentication, paywalls or geo-restrictions.
- Third-party streams and VOD sources are not guaranteed to remain available.
- Only use VOD content that is authorized, public domain, appropriately licensed or otherwise legally available for the intended use.
### Privacy
- Potential data: name, email, password hash, profile information, favorites, history, device/session data, preferences, recommendations and security logs.
- Purposes: authentication, account management, synchronization, personalization, security and service functionality.
- Define retention, security, third parties and user rights based on actual implementation and applicable law.
- Final legal text must be reviewed against actual data practices.
### Cookies
- Essential authentication/session/security cookies.
- Preference storage.
- Analytics only if implemented.
- Avoid unnecessary tracking.
- Obtain consent for non-essential cookies where required.
### Terms
- Acceptance.
- Eligibility.
- Accounts.
- Private access.
- Prohibited behavior.
- Third-party content and sources.
- Availability.
- Intellectual property.
- Suspension.
- Liability.
- Changes.
- Governing law.
## 20. Visual and UX Direction
- Premium dark streaming interface.
- Cinematic, minimal, modern and spacious.
- Smooth but restrained motion.
- Fast perceived performance.
- Consumer experience should feel like a modern streaming service rather than a traditional IPTV table.
- Live and VOD content types must be visually distinguishable.
- Admin interface may use a conventional dashboard layout.
- Mobile-first responsive design.
## 21. Performance
- Cache playlist data.
- Cache EPG data.
- Lazy-load images.
- Lazy-load player resources where appropriate.
- Image optimization.
- Compression.
- Code splitting.
- Pagination for large catalogues.
- Minimal API payloads.
- Do not route primary video traffic through Hostinger unless a future architecture explicitly requires it.
## 22. Hostinger Deployment
Production is intended to run on the existing Hostinger Premium Web Hosting environment.
- React/Vite production build.
- PHP API.
- MySQL database.
- User/account data.
- Channel metadata.
- EPG data.
- VOD metadata and source configuration.
- PWA assets.
- Legal pages.
Example structure:
- public_html/
- index.html
- assets/
- api/
- auth/
- users/
- channels/
- epg/
- playlist/
- vod/
- vod-sources/
- admin/
React Router rewrite rules should send application routes to index.html while excluding /api/ endpoints.
## 23. Development Phases
1. Foundation: React/Vite structure, routing, design system, API foundation, authentication.
1. IPTV engine: retrieve, parse, normalize, deduplicate, categorize and cache IPTV-org data.
1. Live playback: in-app player, HLS support, error handling and direct browser playback.
1. Streaming UI: Home, Live TV, channel details, search and responsive navigation.
1. VOD engine: source abstraction, VOD ingestion, movie/series catalogue, metadata and playback.
1. Accounts/personalization: favorites, history, resume positions, cross-device sync and recommendations.
1. EPG: ingestion, TV Guide, current/next/full schedule and programme search.
1. PWA/device: installability, service worker, offline metadata caching, PiP and casting.
1. Admin: users, invitations, channels, VOD, VOD sources, playlist, EPG, audit logs and settings.
1. Legal: Terms, Privacy, Cookies, Copyright and legal-request workflow.
1. Testing/launch: responsive QA, browser/device playback testing, security checks, performance checks and production deployment.
## 24. V1 Success Criteria
- Invited users can create accounts and securely log in.
- Live channels can be browsed by category/country and played inside the Canice Free Watch interface where browser/source constraints permit.
- Hostinger is not used as the primary live-video delivery layer.
- Users can access a separate on-demand Movies experience.
- Users can access a separate on-demand Series experience with categories and seasons/episodes where available.
- Movies and series have appropriate metadata and artwork.
- Search spans live and on-demand content.
- Users can save content to My List.
- VOD playback can resume from the stored position.
- Live viewing appears in Recently Watched.
- EPG shows current, next and scheduled programming where source data exists.
- Favorites/history/preferences sync across supported devices.
- Recommendations use user behavior and content metadata.
- The site can be installed as a PWA.
- Admin can manage users, invitations, channels, VOD, VOD sources, EPG, playlist and system activity.
- Legal pages and registration consent are implemented.
- Security controls are implemented server-side.
- The application does not bypass technical access controls or facilitate unauthorized content acquisition.
## 25. Key Product Rule
Canice Free Watch is a hybrid streaming interface: IPTV-org powers the Live TV side; authorized/free VOD sources power standalone Movies and Series; metadata services such as TMDB can enrich the catalogue; and the user's browser plays the actual video while Hostinger primarily serves the application, API and metadata.
## 26. Scope Boundary
- No Netflix content integration.
- No assumption that IPTV-org's M3U is a standalone movie/series catalogue.
- No arbitrary movie/series scraping from unauthorized websites.
- No DRM bypass.
- No paywall, authentication or geo-block circumvention.
- No arbitrary video downloading/recording in V1.
- No requirement to proxy all video through Hostinger.
- Third-party source availability is inherently subject to change.