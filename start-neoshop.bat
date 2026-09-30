@echo off
title NeoShop Launcher

echo ==========================================
echo        Starting NeoShop Project
echo ==========================================
echo.

cd /d E:\NeoShop-main

echo Loading environment variables...

if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create E:\NeoShop-main\.env
    pause
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"

echo Environment variables loaded.

echo.
echo Setting Java timezone...
set "JAVA_TOOL_OPTIONS=-Duser.timezone=UTC"

echo.
echo Starting Docker infrastructure...
docker compose up -d

if errorlevel 1 (
    echo ERROR: Docker Compose failed.
    pause
    exit /b 1
)

echo.
echo Waiting for PostgreSQL...

:wait_for_postgres
powershell -Command "if (Test-NetConnection localhost -Port 5432 -InformationLevel Quiet) { exit 0 } else { exit 1 }"

if errorlevel 1 (
    echo PostgreSQL is not ready yet. Waiting 3 seconds...
    timeout /t 3 /nobreak >nul
    goto wait_for_postgres
)

echo PostgreSQL is ready!

echo.
echo ==========================================
echo Starting Config Server
echo ==========================================

start "NeoShop - Config Server" cmd /k "cd /d E:\NeoShop-main\services\config-server && mvnw.cmd spring-boot:run"

timeout /t 15 /nobreak >nul

echo.
echo ==========================================
echo Starting Discovery Server
echo ==========================================

start "NeoShop - Discovery Server" cmd /k "cd /d E:\NeoShop-main\services\discovery && mvnw.cmd spring-boot:run"

timeout /t 20 /nobreak >nul

echo.
echo ==========================================
echo Starting Gateway
echo ==========================================

start "NeoShop - Gateway" cmd /k "cd /d E:\NeoShop-main\services\gateway && mvnw.cmd spring-boot:run"

timeout /t 15 /nobreak >nul

echo.
echo ==========================================
echo Starting Customer Service
echo ==========================================

start "NeoShop - Customer" cmd /k "cd /d E:\NeoShop-main\services\customer && mvnw.cmd spring-boot:run"

echo.
echo Starting Product Service...

start "NeoShop - Product" cmd /k "cd /d E:\NeoShop-main\services\product && mvnw.cmd spring-boot:run"

echo.
echo Starting Payment Service...

start "NeoShop - Payment" cmd /k "cd /d E:\NeoShop-main\services\payment && mvnw.cmd spring-boot:run"

echo.
echo Starting Order Service...

start "NeoShop - Order" cmd /k "cd /d E:\NeoShop-main\services\order && mvnw.cmd spring-boot:run"

echo.
echo Starting Notification Service...

start "NeoShop - Notification" cmd /k "cd /d E:\NeoShop-main\services\notification && mvnw.cmd spring-boot:run"

echo.
echo Starting Review Service...

start "NeoShop - Review" cmd /k "cd /d E:\NeoShop-main\services\review && E:\MavenCache\wrapper\dists\apache-maven-3.9.9\977a63e90f436cd6ade95b4c0e10c20c\bin\mvn.cmd spring-boot:run"

echo.
echo Waiting for backend services...
timeout /t 15 /nobreak >nul

echo.
echo ==========================================

echo.
echo ==========================================
echo        NeoShop is starting
echo ==========================================
echo.
echo Frontend:  http://localhost:5173
echo Gateway:   http://localhost:8222
echo Eureka:    http://localhost:8761
echo Keycloak:  http://localhost:9098
echo MailDev:   http://localhost:1080
echo Zipkin:    http://localhost:9411
echo.
echo Review Service: http://localhost:8061
echo.
pause