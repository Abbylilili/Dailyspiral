# Daily Spiral - Project Context & Development Guide

## 1. 架构原则 (Architecture Standards)
- **文件行数限制**: 每个文件严禁超过 200 行。
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

## 3. 开发规范 (Engineering Standards)
- **类型安全**: 严禁使用 `any`。所有数据结构必须定义 Interface。
- **异步处理**: 统一使用 `async/await`，并配套错误处理和 Loading 状态。
- **主题适配**: 组件必须适配现有的四种主题（Pastel, Ocean, Ink, Zen）。

## 4. 当前任务 (Ongoing)
- ✅ 身份认证与基础数据库连接。
- ⏳ 全局代码重构：按以上规范将现有页面模块化。
- ⏳ AI 建议集成。
