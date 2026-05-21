@echo off
echo Setting up VoiceMind...

REM Create .env from example
if not exist .env (
  copy .env.example .env
  echo Created .env
)

REM Create frontend .env.local
if not exist apps\web\.env.local (
  copy apps\web\.env.local.example apps\web\.env.local
  echo Created apps\web\.env.local
)

REM Create uploads directory
if not exist apps\api\uploads mkdir apps\api\uploads

REM Install dependencies
echo Installing dependencies...
call pnpm install

echo.
echo Setup complete!
echo.
echo Run in separate terminals:
echo   Terminal 1: pnpm dev:api
echo   Terminal 2: pnpm dev:web
echo.
pause
