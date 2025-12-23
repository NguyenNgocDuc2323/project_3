Write-Host "Starting Docker Compose services..." -ForegroundColor Green
docker-compose down
docker-compose up -d --build
Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "`nServices status:" -ForegroundColor Cyan
docker-compose ps
Write-Host "`nFrontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Green
Write-Host "Swagger: http://localhost:5000/swagger" -ForegroundColor Green
Write-Host "`nTo view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop: docker-compose down" -ForegroundColor Yellow

