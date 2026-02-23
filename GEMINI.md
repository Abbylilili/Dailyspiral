# Daily Spiral - Project Context & Development Guide

## 1. 架构原则 (Architecture Standards)
- **文件行数限制**: 每个文件严禁超过 200 行。
- **模块封装 (Folder-as-a-Module)**: 所有的组件、Hooks、Utils 必须采用文件夹封装模式。
    - 必须建立以模块名命名的文件夹（如 `components/Button/`）。
    - 文件夹内必须包含 `index.ts`，统一使用 `export { default } from './[Name]'` 导出。
    - 这种结构适用于页面级组件、全局组件、Hook 以及工具函数。
- **目录结构 (Domain-Driven)**:
    - `src/app/components/`: 全局通用 UI 组件（如 Button, Input, Layout）。
    - `src/app/hooks/`: 全局通用 Hooks（如 useAuth, useTheme）。
    - `src/app/utils/`: 全局工具函数。
    - `src/app/services/`: 外部服务集成（如 Supabase 逻辑、OpenAI API）。
    - `src/app/pages/[PageName]/`:
        - `index.ts`: 导出页面组件。
        - `[PageName].tsx`: 页面入口，负责编排布局。
        - `components/`: 页面专用子组件。
        - `hooks/`: 页面专用逻辑 Hooks。
        - `utils/`: 页面专用计算/转换函数。

## 2. 代码风格规范 (Code Style)
- **组件定义**: 统一使用 `const Page: FC = () => { ... }` 模式。
- **类型导入**: 必须使用 `import type { FC } from 'react'`。
- **声明式 UI**: 页面主文件应尽量简洁，通过自定义 Layout 组件（Slots 模式）组合 UI。
- **逻辑抽离**: 
    - 数据获取和副作用必须移至 `hooks/`。
    - 纯数据计算和格式化必须移至 `utils/`。
- **导出规范**: 页面组件使用 `export default`。
- **引用规范**: 
    - 必须使用路径别名 `@/`（如 `@/app/components/ui/button`），严禁使用深层相对路径（如 `../../../../`）。
    - 严禁在 import 路径中包含 `.tsx` 或 `.ts` 后缀。
    - 充分利用文件夹模块化，仅引用到文件夹名（由内部 `index.ts` 负责实际导出）。

## 3. 开发规范 (Engineering Standards)
- **类型安全**: 严禁使用 `any`。所有数据结构必须定义 Interface。
- **异步处理**: 统一使用 `async/await`，并配套错误处理和 Loading 状态。
- **主题适配**: 组件必须适配现有的四种主题（Pastel, Ocean, Ink, Zen）。
