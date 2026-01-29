#!/bin/bash

# Script để chạy migration cho database
echo "🔄 Đang tạo migration..."
dotnet ef migrations add AddProfileAndCartFeatures

echo "📦 Đang cập nhật database..."
dotnet ef database update

echo "✅ Migration hoàn tất!"

