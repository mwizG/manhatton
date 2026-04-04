# Frontend brief for v0

## Project summary
This is a Django-based farm management system for a working farm business. The first React version should feel like a modern operations dashboard for the farm owner or manager.

The dashboard should help the user answer these questions quickly:
- How much money was spent?
- How much money was earned?
- Is the farm profitable right now?
- What inputs or chemicals are recommended?
- What is the current weather where the farm operates?

This first v0 build should be polished, clear, and trustworthy, but not overly complex.

## Product direction
Build a dashboard-first interface that replaces the old plain Django pages for daily decision-making.

The style should feel:
- modern
- calm
- data-driven
- easy to scan
- mobile responsive
- practical for rural or low-friction use

## Target user
Primary user:
- farm owner / farm manager

Secondary users:
- field supervisor
- accountant / admin assistant

## Core UX principle
The page should be readable within 5 seconds.

The user should immediately see:
1. profitability summary
2. recent financial activity
3. recommendation insights
4. weather conditions

## Scope for v0
### In scope
- dashboard home page
- finance summary cards
- filter controls for the logbook summary
- expense and sales trend visualizations
- chemical recommendation table
- weather lookup panel
- loading, empty, and error states

### Out of scope for v0
- full CRUD forms
- complex routing
- authentication screens
- admin screens
- deep analytics
- chart libraries if a simple custom trend bar works better

## User journey
1. User signs in through Django session login.
2. User opens the dashboard.
3. Dashboard loads summary data automatically.
4. User sees total spent, total earned, and profit.
5. User filters the logbook by year, date range, item, category, or amount.
6. User reviews recent expense and sales patterns.
7. User reads the chemical recommendations section.
8. User checks current weather for the farm location or another city.

## Information architecture
### Main page sections
1. Header / page intro
2. KPI summary cards
3. Filter bar
4. Trend overview
5. Recent logbook tables
6. Chemical recommendations
7. Weather panel

## Required screen: Dashboard home
This is the main screen v0 should produce.

### Header content
Include:
- page title, such as Farm Dashboard
- short subtitle explaining the page purpose
- small status pills, such as Session auth and Same-origin

### KPI cards
Show these three main metrics prominently:
- total spent
- total earned
- profit

Also consider showing:
- record count
- weather condition
- last updated state

### Filter controls
Create a compact, clear filter area for the summary endpoint.

Support filter modes:
- date range
- year
- item
- product
- category
- spent amount
- earned amount

Expected behavior:
- changing the filter updates the dashboard summary
- users can clear filters quickly
- controls should not feel cluttered on mobile

### Trend overview
Show expense and sales trend data in a readable way.

Possible presentation options:
- simple horizontal bars
- compact table rows
- minimalist timeline cards

If a chart is used, keep it simple and readable rather than decorative.

### Recent logbook tables
Show two side-by-side tables or stacked cards:
- expenses
- sales

Each table should include:
- item or product
- category
- quantity
- amount spent or earned
- date

### Chemical recommendations
Show a table or grouped cards that summarize recommendations by:
- chemical
- plant
- illness
- success rate
- total count

### Weather panel
Show current weather details clearly.

The panel should allow:
- city input
- country input
- refresh action

Useful values to display:
- weather condition
- temperature
- short message or status

## Optional future screens
These should not be required in v0, but the design should leave space for them later.
- logbook detail page
- chemical tracker page
- planting page
- sales page
- weather detail page
- record management page

## API contracts available now
### GET /api/logbook/summary/
Returns financial totals and grouped trend data.

Query parameters:
- filter_by
- filter_value
- filter_value_min
- filter_value_max
- filter_range_start
- filter_range_end

Example usage:
- /api/logbook/summary/?filter_by=year&filter_value=2026
- /api/logbook/summary/?filter_by=date_range&filter_range_start=2026-01-01&filter_range_end=2026-12-31
- /api/logbook/summary/?filter_by=item&filter_value=seed
- /api/logbook/summary/?filter_by=amount_spent&filter_value_min=100&filter_value_max=1000

Expected response fields to display:
- totals.spent
- totals.earned
- totals.profit
- series.expenses
- series.sales

### GET /api/chemical-tracker/suggestions/
Returns recommendation summaries grouped by chemical, plant, and illness.

Expected response fields to display:
- chemical__name
- plant
- illness
- success_rate
- total_count

### GET /api/weather/current/
Returns the current weather for the configured location.

Expected behavior:
- should load asynchronously
- should fail gracefully if the API key or service is unavailable
- should not block the rest of the dashboard

## Authentication and session handling
- Django session auth is already in use.
- Requests should include credentials.
- Treat the user as already signed in.
- Do not design a login flow for this v0 brief.

## Data handling rules
- Treat API data as read-only in v0.
- Display loading states for each major area.
- Display empty states when there is no data.
- Display clear error states when an API fails.
- Avoid crashing the whole page if one section fails.

## Empty state copy guidance
Use short, helpful messages.

Examples:
- No summary data available yet.
- No expense entries found for this filter.
- No sales entries found for this filter.
- No chemical recommendations available yet.
- Weather data is unavailable right now.

## Error state guidance
The UI should show meaningful errors, not raw stack traces.

Examples:
- Unable to load dashboard data.
- Weather lookup unavailable right now.
- Something went wrong while fetching recommendations.

## Design direction
### Visual style
- white cards on a light neutral background
- soft shadow depth
- strong spacing and clear hierarchy
- blue / indigo accent color
- red for expense emphasis
- green or teal for sales emphasis

### Typography
- use a clean system font stack or a modern sans-serif
- large page title
- bold KPI numbers
- smaller explanatory text

### Layout
- desktop: multi-column card grid
- tablet: two-column reduction
- mobile: single-column stacking

### Interaction style
- filters should be easy to scan
- buttons should have obvious hover and active states
- edit/delete actions are not required in v0
- refresh actions should feel immediate

## Accessibility notes
- preserve strong color contrast
- use real labels for inputs
- keep buttons large enough for touch
- ensure the page remains usable without perfect imagery or animation
- do not rely on color alone to communicate meaning

## Copy tone
The voice should be:
- concise
- businesslike
- friendly
- practical

Avoid overly playful marketing language.

## Suggested component structure
The v0 app can be built from these reusable parts:
- App shell
- Page header
- KPI card
- Filter panel
- Trend overview card
- Data table
- Weather card
- Status badge
- Loading placeholder
- Error message block
- Empty state block

## Suggested layout behavior
### Desktop
- KPI cards across the top
- filter panel beneath the header
- trends and weather side-by-side where space allows
- tables in a two-column grid

### Mobile
- stack every section vertically
- collapse filter controls into a single column
- keep the most important metrics at the top
- tables should scroll or compress well

## Non-goals
Do not spend time on:
- account creation
- password reset
- role management
- complex charts
- heavy animations
- redesigning backend data models

## Success criteria
The v0 frontend is successful if:
- it feels like a real farm operations dashboard
- the main metrics are visible immediately
- filters work clearly and predictably
- the weather section feels useful, not decorative
- chemical recommendations are easy to scan
- the page looks polished on desktop and mobile
- the user can understand the farm’s status without reading much

## Implementation hint for v0
If needed, start with a strong dashboard shell first, then add:
1. KPI cards
2. filters
3. summary trends
4. tables
5. weather
6. recommendation insights

That order will give the cleanest first impression.
