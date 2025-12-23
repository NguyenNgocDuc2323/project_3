#!/bin/bash

echo "Starting Docker Compose services..."
docker-compose down
docker-compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 10

echo ""
echo "Services status:"
docker-compose ps

echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "Swagger: http://localhost:5000/swagger"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

