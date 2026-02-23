# Daily Spiral

A modern life management application integrating expense tracking, mood journaling, habit formation, and AI-driven insights.

## 🚀 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start development server**:
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

---
*Original project design available at [Figma Design](https://www.figma.com/design/3YHdo8d7DR8q953UgUwkjQ/Daily-Spiral-PRD-Report).*
