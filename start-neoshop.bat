@echo off
title NeoShop Launcher

cd /d E:\NeoShop-main

echo.
echo ==========================================
echo          NEOSHOP LAUNCHER
echo ==========================================
echo.

REM ============================================================
REM LOAD ENVIRONMENT
REM ============================================================

echo Loading environment variables...

if not exist ".env" (
    echo.
    echo ERROR: .env file not found!
    echo Expected:
    echo E:\NeoShop-main\.env
    echo.
    pause
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if not "%%A"=="" set "%%A=%%B"
)

echo Environment variables loaded.

REM ============================================================
REM JAVA
REM ============================================================

echo.
echo Setting Java timezone...

set "JAVA_TOOL_OPTIONS=-Duser.timezone=UTC"

REM ============================================================
REM CHECK MAVEN
REM ============================================================

echo.
echo Checking Maven...

where mvn >nul 2>&1

if errorlevel 1 (
    echo.
    echo ERROR: Maven was not found.
    echo Make sure "mvn -version" works in CMD.
    echo.
    pause
    exit /b 1
)

echo Maven found.

REM ============================================================
REM DOCKER INFRASTRUCTURE
REM ============================================================

echo.
echo ==========================================
echo Starting Docker infrastructure
echo ==========================================
echo.

docker compose up -d

if errorlevel 1 (
    echo.
    echo ERROR: Docker Compose failed.
    echo.
    pause
    exit /b 1
)

echo.
echo Docker infrastructure started.

REM ============================================================
REM WAIT FOR POSTGRES
REM ============================================================

echo.
echo Waiting for PostgreSQL...

:WAIT_POSTGRES

powershell -NoProfile -Command "if (Test-NetConnection 127.0.0.1 -Port 5432 -InformationLevel Quiet) { exit 0 } else { exit 1 }"

if errorlevel 1 (
    echo PostgreSQL is not ready. Waiting 3 seconds...
    timeout /t 3 /nobreak >nul
    goto WAIT_POSTGRES
)

echo PostgreSQL is ready.

REM ============================================================
REM CONFIG SERVER
REM ============================================================

echo.
echo ==========================================
echo Starting Config Server
echo ==========================================
echo.

start "NeoShop - Config Server" cmd /k "cd /d E:\NeoShop-main\services\config-server && mvn spring-boot:run"

echo Config Server launched.
echo Waiting 15 seconds...

timeout /t 15 /nobreak >nul

REM ============================================================
REM DISCOVERY
REM ============================================================

echo.
echo ==========================================
echo Starting Discovery Server
echo ==========================================
echo.

start "NeoShop - Discovery" cmd /k "cd /d E:\NeoShop-main\services\discovery && mvn spring-boot:run"

echo Discovery launched.
echo Waiting 20 seconds...

timeout /t 20 /nobreak >nul

REM ============================================================
REM CUSTOMER
REM ============================================================

echo.
echo ==========================================
echo Starting Customer Service
echo ==========================================
echo.

start "NeoShop - Customer" cmd /k "cd /d E:\NeoShop-main\services\customer && mvn spring-boot:run"

REM ============================================================
REM PRODUCT
REM ============================================================

echo.
echo Starting Product Service...

start "NeoShop - Product" cmd /k "cd /d E:\NeoShop-main\services\product && mvn spring-boot:run"

REM ============================================================
REM PAYMENT
REM ============================================================

echo.
echo Starting Payment Service...

start "NeoShop - Payment" cmd /k "cd /d E:\NeoShop-main\services\payment && mvn spring-boot:run"

REM ============================================================
REM ORDER
REM ============================================================

echo.
echo Starting Order Service...

start "NeoShop - Order" cmd /k "cd /d E:\NeoShop-main\services\order && mvn spring-boot:run"

REM ============================================================
REM NOTIFICATION
REM ============================================================

echo.
echo Starting Notification Service...

start "NeoShop - Notification" cmd /k "cd /d E:\NeoShop-main\services\notification && mvn spring-boot:run"

REM ============================================================
REM REVIEW
REM ============================================================

echo.
echo Starting Review Service...

start "NeoShop - Review" cmd /k "cd /d E:\NeoShop-main\services\review && mvn spring-boot:run"

REM ============================================================
REM WAIT FOR BACKEND
REM ============================================================

echo.
echo ==========================================
echo Backend services are starting...
echo ==========================================
echo.

timeout /t 20 /nobreak >nul

REM ============================================================
REM GATEWAY
REM ============================================================

echo.
echo ==========================================
echo Starting API Gateway
echo ==========================================
echo.

start "NeoShop - Gateway" cmd /k "cd /d E:\NeoShop-main\services\gateway && mvn spring-boot:run"

echo Gateway launched.
echo Waiting 10 seconds...

timeout /t 10 /nobreak >nul

REM ============================================================
REM DONE
REM ============================================================

echo.
echo.
echo ==========================================
echo       NEOSHOP BACKEND IS STARTING
echo ==========================================
echo.
echo Gateway        : http://localhost:8222
echo Config Server  : http://localhost:8888
echo Eureka         : http://localhost:8761
echo Keycloak       : http://localhost:9098
echo MailDev        : http://localhost:1080
echo Zipkin         : http://localhost:9411
echo.
echo Customer       : http://localhost:8090
echo Product        : http://localhost:8050
echo Payment        : http://localhost:8060
echo Order          : http://localhost:8070
echo Review         : http://localhost:8061
echo Notification   : http://localhost:8040
echo.
echo ==========================================
echo All backend services have been launched.
echo ==========================================
echo.

pause