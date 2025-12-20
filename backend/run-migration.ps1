# Script to run database migration
Write-Host "Running database migration..." -ForegroundColor Green
dotnet ef database update --project Backend.csproj
Write-Host "Migration completed!" -ForegroundColor Green

