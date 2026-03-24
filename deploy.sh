#!/bin/bash
# 生产模式发布 (代码混淆 + 压缩)
echo "🚀 Starting PRODUCTION deploy..."
docker-compose down 2>/dev/null
docker-compose up --build -d
echo ""
echo "✅ Deploy complete!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo ""
echo "📋 View logs: docker-compose logs -f"
