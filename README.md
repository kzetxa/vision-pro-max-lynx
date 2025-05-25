# Workout App (React + Vite + TS + Supabase + Radix UI)

This project is a frontend application for a workout app, using React, Vite, TypeScript, and Radix UI components. It fetches data directly from Supabase. An optional sync script is provided to populate Supabase tables from an Airtable base.

## Project Structure

```
/src
├── /components
│   ├── WorkoutCard.tsx         # Displays a single workout preview on the home page
│   ├── BlockViewer.tsx         # Displays a single block of exercises within a workout
│   ├── ExerciseTile.tsx        # Displays a single exercise within a block
│   └── CompletionChart.tsx     # (Future) Displays a chart of completed muscle groups
├── /pages
│   ├── Home.tsx                # Home page, lists available workouts with infinite scroll
│   └── WorkoutPage.tsx         # Workout detail page, displays blocks and exercises
├── /lib
│   ├── supabase.ts           # Supabase client initialization
│   ├── api.ts                # Supabase data fetching functions
│   ├── types.ts              # TypeScript type definitions (Airtable and Supabase)
│   └── utils.ts              # Utility functions
├── App.tsx                   # Main application component with routing
├── main.tsx                  # React application entry point
└── index.css                 # Global styles (to be potentially replaced by modules)

/scripts
└── sync.ts                   # Script to sync data from Airtable to Supabase

index.html                    # Main HTML file
package.json                  # Project dependencies and scripts
vite.config.ts                # Vite configuration
tsconfig.json                 # TypeScript compiler options
README.md                     # This file
.env.example                  # Example environment variables
```

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd vision-pro-max-lynx # Or your project directory name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Copy the `.env.example` file to `.env` and add your Supabase credentials:
    ```dotenv
    # Required for the frontend application
    VITE_SUPABASE_URL="your_supabase_project_url"
    VITE_SUPABASE_ANON_KEY="your_VITE_SUPABASE_ANON_KEY"

    # Required ONLY for running the sync script (scripts/sync.ts)
    VITE_AIRTABLE_API_KEY="your_VITE_AIRTABLE_API_KEY"
    VITE_AIRTABLE_BASE_ID="your_VITE_AIRTABLE_BASE_ID"
    # Example: AIRTABLE_TABLE_NAMES='{"exercises": "Exercise Library", "blocksOverview": "Blocks Overview", "individualBlocks": "Individual Blocks", "workouts": "Workouts"}'
    AIRTABLE_TABLE_NAMES='your_airtable_table_names_json_string'
    VITE_SUPABASE_URL="your_supabase_project_url" # Yes, needed again for the script
    SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key" # Service role key needed for upserting
    ```
    *   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed to the frontend client (safe).
    *   The `AIRTABLE_*` and `SUPABASE_SERVICE_ROLE_KEY` variables are sensitive and should only be used in the `.env` file for the local sync script. **Do not commit your `.env` file.**

4.  **Run the Vite development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:5174` (or the next available port).

## Syncing Data from Airtable (Optional)

If you have workout data structured in Airtable according to the schema expected by `scripts/sync.ts` (check the type definitions in `src/lib/types.ts` and the script itself), you can populate your Supabase tables using this script.

**Prerequisites:**
*   Ensure your Supabase project has tables matching the script's expectations (`exercise_library`, `blocks_overview`, `individual_blocks`, `workouts`) with appropriate columns and relationships.
*   Set the necessary environment variables in your `.env` file (see step 3).

**Running the sync script:**
```bash
npx tsx ./scripts/sync.ts
```
This will fetch data from your specified Airtable tables and upsert it into the corresponding Supabase tables.

## Frontend Functionality

*   **Home Page (`/`):**
    *   Fetches and displays workout previews from the Supabase `workouts` table.
    *   Uses infinite scrolling to load more workouts as the user scrolls down.
    *   Each workout card links to its detail page.
*   **Workout Page (`/workout/:workoutId`):**
    *   Fetches detailed data for a specific workout from Supabase, including related blocks and exercises via joins.
    *   Displays workout details, blocks, and exercises.
    *   (Future) Will include functionality for tracking progress and completion.

## Styling

*   Styling is primarily handled using **CSS/SCSS Modules** (`.module.css` or `.module.scss`).
*   A central theme file (`src/styles/theme.module.scss`) defines reusable SCSS variables for colors, spacing, shadows, borders, and radii.
*   Component-specific module files should `@use '../styles/theme.module.scss' as theme;` to access these variables.
*   The global `src/index.css` file should ideally only contain minimal base resets or global font settings, not component-specific styles.
*   Radix UI components are used for some UI elements (Dialog, Checkbox, etc.). Their styling can be customized using standard CSS/SCSS targeting their data attributes, or potentially overridden within module files if needed.
*   The previous glassmorphism theme applied via `index.css` and inline styles has been removed in favor of the module-based approach.

## Frontend Goals

*   **/ (Home Page):**
    *   Fetch and display workouts from the `workout-proto` view.
    *   Render each workout as a glassmorphic Radix card.
    *   Link cards to `/workout/:workoutId?clientid=abc123`.
*   **/workout/:workoutId (Workout Page):**
    *   Fetch full workout details, including linked blocks and their exercises.
    *   Display block information (name, sets/reps, equipment).
    *   Display each exercise as a tile (Vimeo embed, title, muscle group).
    *   Implement checkmarks for set/exercise completion (persisted via Supabase).
    *   "Finish Workout" button to render a muscle group pie chart.

## Persistence

*   Client progress is persisted using Supabase.
*   Tables: `workout_progress`, `exercise_completion` (or a combined table).
*   Schema: `{ workoutId, clientid, exerciseId, blockId, status }`