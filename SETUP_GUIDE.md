# Michael Jewellery — Complete Setup & Deployment Guide

This guide covers a fresh setup, SQL Server configuration, local image storage, admin creation, build/deployment, updates, backups, and common troubleshooting for the Michael Jewellery catalogue.

## 1. Project Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Microsoft SQL Server
- Local VPS filesystem for product/site images
- Custom MSSQL-backed admin authentication

Supabase is not required at runtime on the `feature/mssql-local-storage` branch.

## 2. Current VPS Reference

Current deployment values:

```text
Project folder: C:\inetpub\wwwroot\mi-diamond
Website port:   8102
Public URL:     http://103.69.196.84:8102/
Admin URL:      http://103.69.196.84:8102/admin
Database:       MiDiamond
SQL host:       127.0.0.1
SQL TCP port:   1633
SQL instance:   MSSQLSERVER2019
```

These values are specific to the current VPS. A different server can use different ports/paths.

## 3. Requirements

Install/verify:

- Git
- Node.js 20+
- npm
- Microsoft SQL Server Database Engine
- SQL Server Management Studio (SSMS)
- SQL Server TCP/IP enabled
- SQL Authentication enabled for the application login

Check SQL services from PowerShell:

```powershell
Get-Service | Where-Object {$_.Name -like "MSSQL*"} | Select Name,Status
```

## 4. Get the Project

For a fresh clone:

```powershell
cd C:\inetpub\wwwroot
git clone https://github.com/dharmendra1031/mi-diamond.git
cd mi-diamond
git fetch origin
git switch feature/mssql-local-storage
git pull origin feature/mssql-local-storage
```

For an existing installation:

```powershell
cd C:\inetpub\wwwroot\mi-diamond
git fetch origin
git switch feature/mssql-local-storage
git pull origin feature/mssql-local-storage
```

## 5. Create the SQL Server Database

Open SSMS and connect to the SQL Server instance.

Create the database:

```sql
USE master;
GO

IF DB_ID(N'MiDiamond') IS NULL
BEGIN
    CREATE DATABASE MiDiamond;
END
GO
```

Then open and execute:

```text
database/mssql-schema.sql
```

Run it against the `MiDiamond` database.

The schema creates and seeds the required tables, categories, products, and site-asset records. The script is designed to be safe to re-run.

Verify tables:

```sql
USE MiDiamond;
GO

SELECT name
FROM sys.tables
ORDER BY name;
```

## 6. Create the Application SQL Login

Do not use `sa` as the website application login.

Create a dedicated login using a strong password:

```sql
USE master;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.server_principals
    WHERE name = N'mi_diamond_app'
)
BEGIN
    CREATE LOGIN [mi_diamond_app]
    WITH PASSWORD = N'REPLACE_WITH_STRONG_PASSWORD',
         CHECK_POLICY = ON,
         CHECK_EXPIRATION = OFF;
END
GO

USE MiDiamond;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.database_principals
    WHERE name = N'mi_diamond_app'
)
BEGIN
    CREATE USER [mi_diamond_app]
    FOR LOGIN [mi_diamond_app]
    WITH DEFAULT_SCHEMA = [dbo];
END
GO

ALTER ROLE [db_datareader] ADD MEMBER [mi_diamond_app];
ALTER ROLE [db_datawriter] ADD MEMBER [mi_diamond_app];
GO
```

If the server password policy rejects the selected password, use a stronger password. If policy bypass is intentionally required for this dedicated SQL login, create it with `CHECK_POLICY = OFF` while still keeping the password private and non-trivial.

## 7. Configure `.env.local`

Create the local environment file:

```powershell
Copy-Item .env.example .env.local -Force
notepad .env.local
```

Current VPS example:

```env
# SQL Server
MSSQL_SERVER=127.0.0.1
MSSQL_PORT=1633
MSSQL_INSTANCE_NAME=
MSSQL_DATABASE=MiDiamond
MSSQL_USER=mi_diamond_app
MSSQL_PASSWORD="REPLACE_WITH_SQL_PASSWORD"
MSSQL_ENCRYPT=false
MSSQL_TRUST_SERVER_CERTIFICATE=true
MSSQL_POOL_MAX=10

# Keep false while using plain HTTP.
SESSION_COOKIE_SECURE=false

# Admin account seed/reset values
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD="REPLACE_WITH_ADMIN_PASSWORD"
ADMIN_NAME=Michael Jewellery Admin

NEXT_PUBLIC_SITE_NAME=Michael Jewellery
NEXT_PUBLIC_SITE_TAGLINE=Fine Jewellery · Kuwait
NEXT_PUBLIC_WHATSAPP_NUMBER=96597850983
NEXT_PUBLIC_INSTAGRAM=michael.jewellerykwt
NEXT_PUBLIC_PHONE=+965 2266 1269
NEXT_PUBLIC_MOBILE=+965 9785 0983
NEXT_PUBLIC_EMAIL=
NEXT_PUBLIC_ADDRESS=Hawalli, Ibn Khaldoon St., Al-Haddad Complex, Shop 3, Kuwait
```

Notes:

- Use quotes around passwords when they contain characters such as `#`, `!`, `@`, or spaces.
- Do not commit `.env.local`.
- Keep `SESSION_COOKIE_SECURE=false` while the site is served as `http://IP:PORT`.
- After HTTPS is enabled, change `SESSION_COOKIE_SECURE=true` and rebuild/restart the app.

## 8. Install Dependencies

```powershell
npm install
```

This project intentionally uses `npm install` when regenerating the dependency lock after the MSSQL migration.

Do not run `npm audit fix` automatically on production without reviewing the dependency changes first.

## 9. Test the MSSQL Connection

```powershell
npm run db:test
```

Expected result for the current catalogue:

```text
MSSQL connection: OK
Database: MiDiamond
Categories: 6
Products: 7
```

If this fails, do not continue to the production build until the connection issue is fixed.

## 10. Migrate Existing Images to Local VPS Storage

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\migrate-images.ps1
```

Images are stored below:

```text
public\uploads\products
public\uploads\site-assets
```

For the current seed migration, the script downloads 17 files.

Verify:

```powershell
(Get-ChildItem .\public\uploads -Recurse -File).Count
```

`public/uploads` is ignored by Git so future `git pull` operations do not overwrite runtime uploads.

## 11. Create or Reset the Admin Account

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `.env.local`, then run:

```powershell
npm run create-admin
```

Expected output:

```text
Admin ready: admin@example.com
User ID: <guid>
```

The command can also be used later to reset the admin password.

## 12. Build the Application

Before rebuilding, stop the process currently listening on port 8102 if one exists:

```powershell
$portPid = (Get-NetTCPConnection -LocalPort 8102 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($portPid) { taskkill /PID $portPid /F /T }
```

Remove the old Next.js build and create a fresh build:

```powershell
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run build
```

Do not delete `.next` while an old Node/Next process is still using it.

## 13. Start the Production Website

```powershell
Start-Process -FilePath "cmd.exe" `
-ArgumentList "/c","npm start -- -p 8102 -H 0.0.0.0 > app.log 2>&1" `
-WorkingDirectory "C:\inetpub\wwwroot\mi-diamond" `
-WindowStyle Hidden
```

Verify the listener:

```powershell
Get-NetTCPConnection -LocalPort 8102 -State Listen
```

Check logs:

```powershell
Get-Content .\app.log -Tail 50
```

Open:

```text
Website: http://103.69.196.84:8102/
Admin:   http://103.69.196.84:8102/admin
```

## 14. Firewall Rule (Only If Required)

If the website port is not reachable externally:

```powershell
New-NetFirewallRule `
  -DisplayName "MiDiamond-8102-In" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8102 `
  -Profile Any
```

The SQL Server port does not need to be exposed publicly when the application and SQL Server run on the same VPS.

## 15. Updating the Live Project from GitHub

Before pulling an update, confirm the branch:

```powershell
cd C:\inetpub\wwwroot\mi-diamond
git branch --show-current
```

Then:

```powershell
git fetch origin
git pull origin feature/mssql-local-storage
npm install
npm run db:test
```

Stop only the process using port 8102:

```powershell
$portPid = (Get-NetTCPConnection -LocalPort 8102 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($portPid) { taskkill /PID $portPid /F /T }
```

Then rebuild and restart:

```powershell
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run build

Start-Process -FilePath "cmd.exe" `
-ArgumentList "/c","npm start -- -p 8102 -H 0.0.0.0 > app.log 2>&1" `
-WorkingDirectory "C:\inetpub\wwwroot\mi-diamond" `
-WindowStyle Hidden
```

Do not kill every Node process on the VPS because other applications may be running on other ports.

## 16. Image Storage Model

Images are not stored as binary data inside SQL Server.

SQL Server stores only paths such as:

```text
/uploads/products/catalog/example.jpg
```

Physical files are stored in:

```text
public\uploads
```

Admin product uploads go to:

```text
public\uploads\products
```

Logo, homepage hero, and About page uploads go to:

```text
public\uploads\site-assets
```

## 17. Backup Requirements

A complete backup requires both:

1. SQL Server database backup of `MiDiamond`.
2. Copy/backup of `C:\inetpub\wwwroot\mi-diamond\public\uploads`.

Backing up only the database will not back up uploaded image files.

Also store a secure copy of production environment settings outside the Git repository.

## 18. Common Troubleshooting

### `Email or password is incorrect`

Reset/create the admin again:

```powershell
npm run create-admin
```

Then sign in using the exact `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in `.env.local`.

### MSSQL connection fails

Run:

```powershell
npm run db:test
```

Confirm:

- SQL Server service is running.
- TCP/IP is enabled.
- Correct SQL port is configured.
- SQL login exists.
- `MiDiamond` exists.
- Application login has database access.

Current VPS uses TCP port `1633`, not `1433`.

### Product/site images are missing

Check:

```powershell
Get-ChildItem .\public\uploads -Recurse -File
```

If this is an initial migration, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\migrate-images.ps1
```

### Port 8102 is already in use

```powershell
(Get-NetTCPConnection -LocalPort 8102 -State Listen).OwningProcess
```

Stop only that PID.

### Build/static assets become missing

Do not delete `.next` while the old Next.js process is running. Stop the 8102 listener first, delete `.next`, rebuild, and restart.

### Admin logs in but is immediately signed out over HTTP

Confirm:

```env
SESSION_COOKIE_SECURE=false
```

Use `true` only after HTTPS is configured.

## 19. Security Checklist

Before final production handover:

- Change any credentials that were shared during setup.
- Use unique SQL and admin passwords.
- Keep `.env.local` out of Git.
- Do not expose SQL Server publicly unless absolutely required.
- Enable HTTPS.
- After HTTPS, set `SESSION_COOKIE_SECURE=true`.
- Keep SQL/database and `public/uploads` backups.
- Review `npm audit` findings manually before dependency upgrades.

## 20. Useful Project Commands

```powershell
npm install
npm run db:test
npm run create-admin
npm run build
npm start -- -p 8102 -H 0.0.0.0
```

Image migration:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\migrate-images.ps1
```

This document should be updated whenever the production database port, application port, deployment path, or storage architecture changes.
