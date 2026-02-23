# Daily Spiral

A modern life management application integrating expense tracking, mood journaling, habit formation, and AI-driven insights.

## 🗄 Database Setup (Supabase)

The project is configured to work with Supabase for data persistence and authentication.

### Option A: Supabase Cloud (Current Setup)
1.  **Dashboard**: Access your data at [https://app.supabase.com/]
2.  **Configuration**:
    -   Go to **Project Settings > API**.
    -   Copy `Project URL` and `anon public` key.
    -   Paste them into your `.env` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Option B: Local Development (Docker)
*Use this if you want to develop offline or have a separate environment.*
1.  **Prerequisites**: Install [Docker Desktop](https://www.docker.com/) and [Supabase CLI](https://supabase.com/docs/guides/cli).
2.  **Start Services**:
    ```bash
    supabase start
    ```
3.  **View Local DB**: Open [http://localhost:54323](Supabase Studio).
4.  **Configuration**: Use the API URL and Keys provided in the terminal output after `supabase start`.

## 🚀 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Environment**:
    -   Copy `.env.example` to `.env`.
    -   Fill in your Supabase credentials (see above).

3.  **Start development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## 🏗 Architecture & Standards

The project follows a strict **Domain-Driven** and **Folder-as-a-Module** architecture to ensure scalability and maintainability.

### 1. Folder-as-a-Module
Every component, hook, or utility must be encapsulated within its own folder:
- **Structure**: `Folder/` containing `Component.tsx` and `index.ts`.
- **Export**: `index.ts` must re-export the module (e.g., `export { default } from './Component'`).
- **Benefit**: Clean imports and clear boundaries.

### 2. Clean Imports
- **Path Alias**: Always use the `@/` alias (e.g., `@/app/components/ui/button`) instead of deep relative paths.
- **No Extensions**: Import paths must not include `.tsx` or `.ts` extensions.
- **Module Import**: Import only to the folder level to leverage the module pattern.

### 3. Engineering Standards
- **Type Safety**: No `any` allowed. Strictly typed interfaces for all data structures.
- **UI Logic**: Pure data logic must be separated into hooks or utilities.
- **Theme Support**: Every component must support all four themes: **Pastel, Ocean, Ink, and Zen**.

