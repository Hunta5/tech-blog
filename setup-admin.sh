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

# Load env vars
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DB_USER="${POSTGRES_USER:-hunta}"
DB_NAME="${POSTGRES_DB:-app_db}"

echo "🔐 Setting up admin account..."

# Generate bcrypt hash directly inside postgres container using plpgsql + pgcrypto
# First, try enabling pgcrypto extension, then use crypt() function
HASH=$(docker exec postgres-db psql -U "$DB_USER" -d "$DB_NAME" -t -c "
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    SELECT crypt('$PASSWORD', gen_salt('bf', 10));
" 2>/dev/null | tr -d ' \n')

if [ -z "$HASH" ]; then
    echo "❌ Failed. Make sure postgres container is running:"
    echo "   docker-compose up -d postgres"
    echo "   or: ./deploy.sh"
    exit 1
fi

echo "✅ Password hash generated"

# Insert or update admin user
docker exec postgres-db psql -U "$DB_USER" -d "$DB_NAME" -c "
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) NOT NULL DEFAULT 'user';
    DELETE FROM users WHERE username = '$USERNAME';
    INSERT INTO users (username, password, invitation_code, role, created_at)
    VALUES ('$USERNAME', '$HASH', 0, 'admin', NOW());
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin account ready!"
    echo "   Username: $USERNAME"
    echo "   Role: admin"
    echo ""
    echo "👉 Go to http://localhost:3000/blog to login."
else
    echo "❌ Database operation failed."
fi
