@echo off
REM Script để chạy migration cho database trên Windows

echo ========================================
echo Kiểm tra dotnet-ef tool...
echo ========================================
dotnet ef --version >nul 2>&1
if errorlevel 1 (
    echo ❌ dotnet-ef chưa được cài đặt!
    echo.
    echo Đang cài đặt dotnet-ef tool...
    dotnet tool install --global dotnet-ef
    if errorlevel 1 (
        echo ❌ Không thể cài đặt dotnet-ef
        echo Vui lòng chạy thủ công: dotnet tool install --global dotnet-ef
        pause
        exit /b 1
    )
    echo ✅ Đã cài đặt dotnet-ef thành công!
    echo.
)

echo ========================================
echo 🔄 Đang tạo migration...
echo ========================================
dotnet ef migrations add AddProfileAndCartFeatures
if errorlevel 1 (
    echo ❌ Lỗi khi tạo migration
    pause
    exit /b 1
)

echo.
echo ========================================
echo 📦 Đang cập nhật database...
echo ========================================
dotnet ef database update
if errorlevel 1 (
    echo ❌ Lỗi khi cập nhật database
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Migration hoàn tất!
echo ========================================
pause

