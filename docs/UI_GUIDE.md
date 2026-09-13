# StarTrack interface

## First use

The public home page explains StarTrack and how to request an account. Its project chart is explicitly illustrative, not a query of the database. New accounts require administrator activation before sign-in.

After sign-in, **Projects** shows the shared active portfolio. Search by project name, principal investigator or department; select a status bar to filter the list. Counts reflect the search, and each project is counted once at its latest version. Clearing filters restores the full active list. Tables paginate at 15 projects and scroll horizontally on small screens.

## Project records

Approved users can create projects and view shared records/history. Work through the project sections, review the entries and save explicitly. There is no autosave or browser-stored draft. Leaving an unsaved create/edit form asks for confirmation; a save in progress must finish first. Browser reload/close uses the browser's own warning, subject to its normal restrictions.

Administrator navigation exposes edit, status and archive controls. Archived projects remain available through **View archived projects**, with read-only history. Archiving retains versions; it is not permanent deletion. Version history displays only recorded attribution, and does not manufacture missing author names.

An edit creates a new version. The complete existing record must load before editing begins. If another update has already changed the project, the server rejects the stale save; keep/copy the draft and reopen the latest version rather than overwriting it.

**Important:** project API access remains shared among authenticated users. Administrator-only frontend controls are a usability convention, not a new server-side project permission boundary. Account administration remains protected by the existing backend administrator checks.

## Account and accessibility

Choose **Profile** in the account menu to open **Manage your account** (`/user`), where you can edit your own details or change your own password. The separate profile overview (`/profile`) also links to this page. User management is administrator-only. No administrator password-reset control is provided.

The interface uses local fonts, Cambridge-derived colour tokens, labelled form controls, keyboard focus cues and a skip-to-content link. The layout is desktop-first and adapts to narrower screens. Existing institutional logos and source acknowledgements are retained.

## Deliberately not included

SharePoint import of PI/project information, AI-assisted search or entry, OAuth/SSO, project ownership permissions and framework upgrades require separate design and approval. No SharePoint or AI connection has been added by this UI phase.
