Student Finance Tracker

An accessible, responsive finance tracker for students, built with vanilla HTML, CSS and JavaScript. No frameworks.

Theme: Student Finance Tracker
Live site (GitHub Pages): https://abdikarim-code271.github.io/Summative-Assessment/
Demo video (unlisted): 
GitHub: https://github.com/abdikarim-code271
Email: a.mohamed1@alustudent.com
Features

Dashboard: total transactions, total expenses, top category, 7-day spending chart
Spending cap with a live message: polite when under the cap, assertive when over
Add, edit and delete transactions (delete asks for confirmation, edit updates updatedAt)
Sort by date, description (A-Z / Z-A) or amount (highest / lowest)
Live regex search with a case-insensitive toggle and <mark> highlighting
Settings: spending cap, exchange rates (RWF base, USD and EUR), display currency, editable categories
Auto-save to localStorage
JSON import (validated before loading), JSON export, CSV export (properly escaped)
Light / dark theme (saved)
Sample data loaded from seed.json on first run
Data model

json
{
  "id": "rec_0001",
  "description": "Lunch at cafeteria",
  "amount": 12.5,
  "category": "Food",
  "date": "2026-10-18",
  "createdAt": "2026-10-18T08:00:00.000Z",
  "updatedAt": "2026-10-18T08:00:00.000Z"
}

Amounts are always stored in RWF. Other currencies are only used for display, using the rates in Settings.

Regex catalog

Rule	Pattern	Examples
Description (no leading/trailing spaces)	^\S(.*\S)?$	"Lunch" passes, " Lunch" fails
Amount	^(0|[1-9]\d*)(\.\d{1,2})?$	12.50 passes, 1.234 and 012 fail
Date (YYYY-MM-DD)	^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$	2025-09-29 passes, 2025-13-01 fails
Category name (Settings)	^[A-Za-z]+(?:[ -][A-Za-z]+)*$	"Fast-food" passes, "Food2" fails
Advanced: duplicate word (back-reference)	\b(\w+)\s+\1\b	"the the cat" is rejected


Dates are also checked against the calendar, so 2025-02-31 is rejected even though it matches the pattern.

Search examples

Goal	Pattern
Cents present	\.\d{2}\b
Beverage keyword	(coffee|tea)
Duplicate word	\b(\w+)\s+\1\b
Starts with a capital letter	^[A-Z]

Invalid patterns do not crash the app. A message appears under the search box and the table keeps showing the last valid view.

Keyboard map

Key	Action
Tab / Shift+Tab	Move between controls
Enter / Space	Activate buttons and links
First Tab on the page	Shows the "skip nav" link, Enter jumps to main content
Up / Down arrows	Change the sort dropdown
Enter inside the form	Save the transaction
Space	Toggle the case-insensitive checkbox
Accessibility notes

Semantic landmarks (header, nav, main, section, footer) and a proper heading order
Skip link and visible focus outlines on every control
Every input has a label; invalid fields get aria-invalid and an error message
role="status" (polite) and role="alert" (assertive) live regions announce saves, errors and budget status
The chart has a text summary for screen readers
Table switches to cards on small screens
Animations are turned off when the user prefers reduced motion
Dark mode colors chosen for readable contrast
Responsive design

Mobile-first, with breakpoints at about 360px, 768px and 1024px.

Run locally

seed.json is loaded with fetch, so the app must run on a server (opening index.html by double-clicking will not load the sample data).

Open the project folder in VS Code
Install the Live Server extension
Right-click index.html and choose Open with Live Server
Run the tests


Open tests.html with Live Server. The page lists PASS or FAIL for each check (regex rules, search helpers, CSV escaping, import validation) and shows a summary at the top.

Project structure

index.html
tests.html
seed.json
README.md
styles/
  main.css
scripts/
  state.js        app data, add/edit/delete, sorting, stats
  storage.js      localStorage, seed loading, import validation, export
  validators.js   regex rules and form validation
  search.js       safe regex compiler, filtering, highlighting
  ui.js           drawing the dashboard, chart and table
  main.js         events and app start-up

Scripts are plain files loaded in this order: state.js, storage.js, validators.js, search.js, ui.js, main.js.

Import / export
Export JSON: downloads all records as transactions.json
Export CSV: downloads transactions.csv (fields with commas or quotes are escaped)
Import JSON: the file is checked first (must be a list, each record needs a unique id, valid description, amount above 0, real date and timestamps). If anything is wrong, nothing is changed and the errors are shown.
Milestones

Milestone	Focus
M1	Spec, wireframe, data model, a11y plan
M2	Semantic HTML and base CSS
M3	Forms and regex validation, tests.html
M4	Render, sort and regex search
M5	Stats and spending cap
M6	Persistence, import/export, settings
M7	Polish, accessibility audit, README, demo video
Author

Individual work by abdikarim-code271.