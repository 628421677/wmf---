# UniAssets - 高校国有资产管理系统

基于 **React + TypeScript + Vite** 的前端项目，面向高校国有资产与房产/公房等业务的管理与可视化展示。

## 技术栈

- **构建工具**: Vite
- **前端框架**: React
- **语言**: TypeScript
- **路由**: react-router-dom
- **数据可视化**: Recharts
- **三维/地图**: Cesium
- **图标**: lucide-react
- **表格导入导出**: xlsx
- **AI 能力**: @google/genai（如需调用 Gemini）

## 环境要求

- Node.js（建议使用较新的 LTS 版本）
- npm

## 快速开始

在项目目录（包含 `package.json` 的目录）执行：

1. 安装依赖

```bash
npm install
```

2. 启动开发环境

```bash
npm run dev
```

启动后默认访问：

- http://localhost:3000/

## 构建与预览

- 构建生产包

```bash
npm run build
```

- 本地预览生产包

```bash
npm run preview
```

## 环境变量（可选）

如果项目中启用了 Gemini/AI 能力，请在项目根目录创建 `.env.local`（不建议提交到仓库）并配置：

```bash
GEMINI_API_KEY=你的key
```

如你们代码中使用了 `VITE_` 前缀读取环境变量（Vite 约定），也可以按需改为：

```bash
VITE_GEMINI_API_KEY=你的key
```

具体以代码实际读取的变量名为准。

## 目录结构（概览）

```text
project/
  components/        # 业务页面/组件（资产、房产、公房、报表等）
  constants/         # 常量与预置数据
  hooks/             # 自定义 hooks
  services/          # 接口/服务封装
  utils/             # 工具函数
  public/            # 静态资源
  App.tsx            # 应用入口组件（路由/布局通常在此）
  index.tsx          # React 挂载入口
  store.ts           # 全局状态/数据存储（如有）
  types.ts           # 类型定义
  vite.config.ts     # Vite 配置
```

## 常见问题

- **端口被占用**
  - 可以关闭占用 3000 的进程，或在 `vite.config.ts` 中修改 `server.port`。

- **Cesium 资源无法加载**
  - Cesium 通常需要正确的静态资源拷贝/路径配置；请检查 `vite.config.ts` 以及 `public/` 下相关资源是否齐全。

## License

如需开源协议，请补充 LICENSE 文件；否则默认视为项目内部使用。