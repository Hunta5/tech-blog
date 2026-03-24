#!/bin/bash
# 首次设置管理员账号
# 用法: ./setup-admin.sh <用户名> <密码>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "用法: ./setup-admin.sh <用户名> <密码>"
    echo "例如: ./setup-admin.sh hunta mypassword123"
    exit 1
fi

USERNAME=$1
PASSWORD=$2

echo "🔐 Setting up admin account..."

# Generate bcrypt hash via Node.js
HASH=$(docker exec nextjs-app node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$PASSWORD', 10);
process.stdout.write(hash);
" 2>/dev/null)

# If production container not running, try dev container
if [ -z "$HASH" ]; then
    HASH=$(docker exec nextjs-dev node -e "
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('$PASSWORD', 10);
    process.stdout.write(hash);
    " 2>/dev/null)
fi

if [ -z "$HASH" ]; then
    echo "❌ Failed to generate password hash. Make sure containers are running."
    exit 1
fi

echo "Generated hash for user: $USERNAME"

# Insert or update admin user
docker exec postgres-db psql -U "${POSTGRES_USER:-hunta}" -d "${POSTGRES_DB:-app_db}" -c "
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) NOT NULL DEFAULT 'user';
    DELETE FROM users WHERE username = '$USERNAME';
    INSERT INTO users (username, password, invitation_code, role, created_at)
    VALUES ('$USERNAME', '$HASH', 0, 'admin', NOW());
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Admin account ready!"
    echo "   Username: $USERNAME"
    echo "   Role: admin"
    echo ""
    echo "Now go to http://localhost:3000/blog to login."
else
    echo "❌ Database operation failed. Make sure postgres is running."
fi
