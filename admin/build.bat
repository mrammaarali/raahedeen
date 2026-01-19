@echo off
SETLOCAL

cd /d "%~dp0"

echo ==== RaaheDeen Admin: Final Build Script ====

set "PATH=C:\Program Files\nodejs;%PATH%"

echo Verifying Node.js and npm...
node -v
npm -v

if %errorlevel% neq 0 (
    echo Node.js or npm not found. Please check your PATH.
    goto :eof
)

echo.
echo ==== Installing dependencies... ====
call npm install
if %errorlevel% neq 0 (
    echo NPM install failed.
    goto :eof
)

echo.
echo ==== Building project... ====
call npm run build
if %errorlevel% neq 0 (
    echo Next.js build failed.
    goto :eof
)

set "DEST_DIR=C:\xampp2\htdocs\raahedeen\admin-deploy"

echo.
echo ==== Preparing destination: %DEST_DIR% ====
if exist "%DEST_DIR%" (
    rmdir /s /q "%DEST_DIR%"
)
mkdir "%DEST_DIR%"

echo.
echo ==== Copying build output to destination ====
robocopy .\out "%DEST_DIR%" /E
if %errorlevel% geq 8 (
    echo Robocopy failed. Build failed.
    goto :eof
)

echo.
echo ==== Creating .htaccess file ====
(
    echo ^<IfModule mod_rewrite.c^>
    echo   RewriteEngine On
    echo   RewriteBase /raahedeen/admin-deploy/
    echo   RewriteRule ^index\.html$ - [L]
    echo   RewriteCond %%{REQUEST_FILENAME} !-f
    echo   RewriteCond %%{REQUEST_FILENAME} !-d
    echo   RewriteRule . /raahedeen/admin-deploy/index.html [L]
    echo ^</IfModule^>
) > "%DEST_DIR%\.htaccess"

echo.
echo ==== SUCCESS! ====
echo Your admin panel has been built and deployed to: %DEST_DIR%
echo Please restart Apache and hard-refresh your browser at http://localhost/raahedeen/admin-deploy

ENDLOCAL
pause
