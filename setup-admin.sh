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

# Step 1: Enable pgcrypto extension
docker exec postgres-db psql -U "$DB_USER" -d "$DB_NAME" -c \
    "CREATE EXTENSION IF NOT EXISTS pgcrypto;" > /dev/null 2>&1

# Step 2: Generate bcrypt hash (separate query, clean output)
HASH=$(docker exec postgres-db psql -U "$DB_USER" -d "$DB_NAME" -t -A -c \
    "SELECT crypt('$PASSWORD', gen_salt('bf', 10));" 2>/dev/null)

if [ -z "$HASH" ]; then
    echo "❌ Failed to generate password hash."
    echo "   Make sure postgres container is running: docker ps | grep postgres"
    exit 1
fi

echo "✅ Password hash generated"

# Step 3: Insert admin user
docker exec postgres-db psql -U "$DB_USER" -d "$DB_NAME" -c "
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) NOT NULL DEFAULT 'user';
    DELETE FROM users WHERE username = '$USERNAME';
    INSERT INTO users (username, password, invitation_code, role, created_at)
    VALUES ('$USERNAME', '$HASH', 0, 'admin', NOW());
" > /dev/null 2>&1

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
