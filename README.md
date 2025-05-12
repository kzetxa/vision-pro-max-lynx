# Workout App (React + LynxJS + Vite + Supabase + Radix UI)

This project is a frontend application for a workout app, using React, Vite, TypeScript, Supabase for persistence, and Radix UI for components. The backend data is sourced from Airtable via Netlify Functions (or a similar backend proxy).

## Project Structure

```
/src
├── /components
│   ├── WorkoutCard.tsx         # Displays a single workout on the home page
│   ├── BlockViewer.tsx         # Displays a single block of exercises
│   ├── ExerciseTile.tsx        # Displays a single exercise
│   └── CompletionChart.tsx     # Displays a chart of completed muscle groups
├── /pages
│   ├── Home.tsx                # Home page, lists available workouts
│   └── Workout.tsx             # Workout detail page
├── /lib
│   ├── supabase.ts           # Supabase client and data functions
│   ├── api.ts                # Airtable data fetching functions (via proxy)
│   └── types.ts              # TypeScript type definitions
├── App.tsx                   # Main application component with routing
├── main.tsx                  # React application entry point
└── index.css                 # Global styles

/api                          # Netlify functions (or equivalent backend proxy)
├── getWorkouts.ts            # Fetches all workouts from Airtable view
├── getWorkoutById.ts         # Fetches a specific workout and its details
└── getBlockById.ts           # Fetches a specific block and its details

index.html                    # Main HTML file
package.json                  # Project dependencies and scripts
 vite.config.ts                # Vite configuration (including proxy for API calls)
ttsconfig.json                 # TypeScript compiler options
README.md                     # This file
```

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd workout-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add your Airtable and Supabase credentials:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    AIRTABLE_API_KEY=your_airtable_api_key 
    ```
    *   `SUPABASE_URL` and `SUPABASE_ANON_KEY` are for the frontend Supabase client.
    *   `AIRTABLE_API_KEY` is used by the Netlify functions (backend). You'll need to set this in your Netlify environment variables when deploying.

4.  **Netlify Dev (for local development with functions):**
    If you are using Netlify Functions, you'll want to use the Netlify CLI to serve your functions and proxy them correctly.
    *   Install Netlify CLI: `npm install -g netlify-cli`
    *   Run: `netlify dev`
    This will typically start your Vite dev server and the functions server, usually making the functions available at `http://localhost:8888/.netlify/functions/`. The `vite.config.ts` is set up to proxy `/api` requests to this.

5.  **Run the Vite development server (if not using `netlify dev` for frontend):**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Backend API Data Source (Airtable)

*   The application fetches data from Airtable using its REST API.
*   API requests are proxied through Netlify Functions (located in the `/api` directory) to protect the Airtable API key.
*   **Primary Data Endpoint (Workouts):** `https://api.airtable.com/v0/appp2JjMRlSvTyvVY/tblqdC3fWyvyFMBxv?view=workout-proto`
    *   This endpoint is used by the `getWorkouts` function.

## Airtable Structure

*   **Level 1: Workouts** (table: `tblqdC3fWyvyFMBxv`)
    *   Fields: `Block 1`, `Block 2`, `Block 3` (linked to Blocks table), `Name`, `Type of workout`, etc.
*   **Level 2: Blocks** (table: `tbloYDsl2c56zGndO`)
    *   Fields: `Block Name`, `Public Name`, `Exercises` (linked to Exercise Library), `Sets & Reps`, etc.
*   **Level 3: Exercises** (table: `tbl8PKDZMG5nv73Hx`)
    *   Fields: `Current Name`, `vimeo video`, `Explination 1-4`, `Primary Muscle Worked`, etc.

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

## Constraints & Conventions

*   Use `fetch` with Bearer headers for Airtable API calls (handled in backend functions).
*   Minimal, clean, modern UI (no Tailwind CSS).
*   Utilize Radix UI components.
*   Glassmorphism style for cards: `backdrop-filter: blur(12px);`, `border-radius: 16px;`, `background: rgba(255,255,255,0.1)`. 