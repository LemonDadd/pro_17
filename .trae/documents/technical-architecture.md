## 1. 架构设计

```mermaid
flowchart TB
    "前端 React SPA" --> "Zustand Store"
    "Zustand Store" --> "localStorage 持久化"
    "前端 React SPA" --> "Color 算法模块"
    "Color 算法模块" --> "OKLCH 色板生成"
    "Color 算法模块" --> "配色方案计算"
    "Color 算法模块" --> "色盲模拟"
    "Color 算法模块" --> "图片取色 Canvas"
    "前端 React SPA" --> "导出模块"
    "导出模块" --> "CSS 变量"
    "导出模块" --> "Tailwind 配置"
    "导出模块" --> "tokens.json"
    "导出模块" --> "LZ-string URL"
```

纯前端 SPA，无后端服务。所有计算与存储均在浏览器本地完成。

## 2. 技术说明

- 前端：React@18 + TypeScript + Tailwind CSS@3 + Vite
- 初始化工具：vite-init（react-ts 模板）
- 状态管理：Zustand（含 localStorage persist 中间件）
- 后端：无
- 数据库：无（localStorage 代替）
- 额外依赖：
  - `culori`：OKLCH / 色彩空间转换与计算
  - `lz-string`：URL 压缩编码
  - `react-colorful`：轻量颜色选择器
  - `prismjs`：代码高亮
  - `lucide-react`：图标

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 首页：色板阶梯 + 配色方案 + 预览面板 |
| /gradient | 渐变编辑器专注页 |
| /shadow | 阴影 + 玻璃态编辑器专注页 |
| /export | 导出汇总页 |

## 4. API 定义

无后端 API。所有数据通过 Zustand store 管理。

### 4.1 核心 Store 数据结构

```typescript
interface Project {
  id: string;
  name: string;
  brandColor: string;
  palette: Record<string, string>;
  colorScheme: {
    type: 'analogous' | 'complementary' | 'triadic' | 'tetradic';
    colors: string[];
  };
  gradient: {
    type: 'linear' | 'radial';
    angle: number;
    stops: { color: string; position: number }[];
  };
  shadows: {
    layers: {
      x: number; y: number; blur: number; spread: number;
      color: string; inset: boolean;
    }[];
  };
  glassmorphism: {
    blur: number;
    backgroundColor: string;
    borderColor: string;
  };
}

interface AppState {
  projects: Project[];
  activeProjectId: string;
  previewMode: 'light' | 'dark';
}
```

## 5. 服务端架构

不适用

## 6. 数据模型

不适用（无数据库）

### 6.1 localStorage 存储结构

- Key: `design-token-projects`
- Value: JSON 序列化的 `AppState`

### 6.2 URL 分享结构

- 使用 LZ-string 压缩编码当前 project 数据
- 格式：`/export?data=<lz-string-encoded>`
