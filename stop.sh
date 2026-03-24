#!/bin/bash
# 停止所有服务
echo "⏹️  Stopping all services..."
docker-compose down 2>/dev/null
docker-compose -f docker-compose.dev.yml down 2>/dev/null
echo "✅ All stopped."
