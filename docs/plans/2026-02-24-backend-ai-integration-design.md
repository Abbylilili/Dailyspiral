# Daily Spiral 后端 AI 集成与每日状态设计方案 (2026-02-24)

## 1. 背景与目标 (Context & Goals)
`Daily Spiral` 需要一个能够理解用户生活节奏、提供深度洞察并给予情感支持的后端系统。目标是实现一个极速启动、具备“动态人格”AI 交互且支持多语言的后端架构。

## 2. 核心架构 (Core Architecture)
采用 **"Fast-Path + Slow-Path" (分级响应)** 架构：
- **Fast-Path (前端/缓存)**: 用户启动 App 时，立即从 `daily_status` 表拉取已就绪的数据。
- **Slow-Path (Edge Function)**: 如果今日数据未准备好，由 Edge Function 在后台异步调用 OpenAI 并更新数据库。

## 3. 数据库设计 (Database Schema)

### 3.1 `daily_status` (每日状态缓存表)
记录用户当天的个性化配置和 AI 生成状态。
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `user_id` | UUID | 关联 auth.users |
| `date` | DATE | 复合主键，确保每日唯一 |
| `lang` | TEXT | 用户当前的语言偏好 (如 'zh-CN', 'en') |
| `quote_content` | TEXT | 今日一言的内容（名言或 AI 鼓励） |
| `quote_source` | TEXT | 来源类型：`library` 或 `ai` |
| `is_insight_ready`| BOOLEAN| 标识昨日 AI 洞察是否已生成 |
| `ai_personality` | TEXT | 当日 AI 采用的人格风格（温柔/清醒/夸夸） |

### 3.2 `quotes_library` (精选名言库)
预置的高质量多语言名言。
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `content` | TEXT | 名言原文 |
| `author` | TEXT | 作者 |
| `language` | TEXT | 语言标识 ('zh-CN', 'en') |
| `category` | TEXT | 分类（如：自律、治愈、金钱观） |

## 4. 多语言支持逻辑 (Multi-language Support)
- **语言注入**: 前端调用接口时携带 `lang` 参数。
- **名言匹配**: 后端优先从对应语言的 `quotes_library` 中检索。
- **AI 响应**: 在 System Prompt 中动态包含指令：`"Ensure all responses are strictly in [User_Language]. Maintain the cultural nuance and poetic depth of that language."`

## 5. AI 动态人格逻辑 (Dynamic AI Logic)
AI 将根据用户昨日的数据表现动态调整回复风格：
- **温柔模式 (Gentle)**: 当昨日心情指数 < 4 时触发，以安抚和情绪价值为主。
- **清醒模式 (Wake-up)**: 当昨日习惯完成度 < 30% 且心情正常时触发，提供深刻的自我管理建议。
- **夸夸模式 (Booster)**: 当昨日习惯 100% 完成或有重大突破时触发，给予热烈鼓励。

## 6. 业务流程 (Business Flow)
1. **启动阶段**: 前端调用 `get-daily-content(lang)`。
2. **状态检查**: 
   - 若 `daily_status` 存在今日且语言匹配的记录，直接返回。
   - 若不存在，随机决定今日一言来源，创建记录。
3. **后台准备**: 若需 AI 生成内容，接口立即返回基础数据，并异步启动 OpenAI 任务。
4. **数据更新**: OpenAI 任务完成后，自动更新 `ai_insights` 和 `daily_status`。

## 7. 异常处理 (Error Handling)
- **超时降级**: AI 响应超过 5 秒时，回退到对应语言的名言库。
- **语言回退**: 若请求语言在名言库中缺失，默认回退到英文版本。
