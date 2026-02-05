#!/usr/bin/env bash

# 一键启动脚本
# 功能：自动安装依赖并同时启动 “智慧校园房产管理系统” 与 “project” 两个 Vite 前端项目的开发服务器。

set -euo pipefail

# 路径
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP1_DIR="$ROOT_DIR/智慧校园房产管理系统"
APP2_DIR="$ROOT_DIR/project"

# 检查 Node 与 npm
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未检测到 Node.js，请先安装 Node.js 后再运行此脚本。" >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ 未检测到 npm，请先安装 npm 后再运行此脚本。" >&2
  exit 1
fi

# 安装依赖（如有必要）
for DIR in "$APP1_DIR" "$APP2_DIR"; do
  if [ ! -d "$DIR/node_modules" ]; then
    echo "📦 正在为 ${DIR##*/} 安装依赖..."
    npm install --prefix "$DIR"
  fi
done

echo "🚀 正在同时启动两个开发服务器 (按 Ctrl+C 终止)..."
# 使用 npx concurrently 并为不同项目输出着色前缀
npx --yes concurrently -n "Campus,Project" -c "blue,green" \
  "npm --prefix '$APP1_DIR' run dev" \
  "npm --prefix '$APP2_DIR' run dev"
