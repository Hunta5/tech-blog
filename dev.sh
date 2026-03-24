#!/bin/bash
# 开发模式启动 (热更新)
echo "🔧 Starting DEV mode..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null
docker-compose -f docker-compose.dev.yml up --build
