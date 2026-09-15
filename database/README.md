# MSSQL + Local Image Storage Cutover

This branch replaces the dataClient runtime with Microsoft SQL Server and local VPS image storage.

## 1. SQL Server prerequisites

The Node.js `mssql` driver connects over TCP. SQL Server Database Engine must be installed and running; SSMS alone is only a management client.

Enable TCP/IP for the SQL Server instance and use a fixed TCP port (1433 is simplest when SQL Server is local to the VPS). SQL Authentication is the recommended setup for this application branch.

## 2. Create/select the database

Create a database named `MiDiamond` (or another name) in SSMS, select that database, then run:

`database/mssql-schema.sql`

The script creates the tables and seeds the current Michael Jewellery categories/products/site assets. It is safe to re-run.

## 3. Configure `.env.local`

Copy `.env.example` to `.env.local` and fill the SQL Server credentials.

For the current HTTP-by-IP VPS deployment keep:

`SESSION_COOKIE_SECURE=false`

Change it to `true` only after HTTPS is enabled.

## 4. Install the new dependency

The dependency tree changed from dataClient to `mssql`, so this branch intentionally regenerates the npm lockfile:

```powershell
npm install
```

After this command a new `package-lock.json` will be generated.

## 5. Move current images into the VPS folder

Run from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\migrate-images.ps1
```

Images will be stored under:

`public\uploads\products`

and:

`public\uploads\site-assets`

The `public/uploads` directory is ignored by Git so future `git pull` operations do not overwrite customer/admin uploads.

## 6. Create/reset the admin account

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` in `.env.local`, then run:

```powershell
npm run create-admin
```

dataClient Auth password hashes cannot be exported, so the admin password must be created once in MSSQL.

## 7. Build

```powershell
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run build
```

Then start the app on the configured port as usual.

## Storage model

New product images uploaded from the admin panel are written to `public/uploads/products`.

Logo, homepage hero and About images are written to `public/uploads/site-assets`.

Only relative public paths such as `/uploads/products/...jpg` are stored in SQL Server; the image binary itself is not stored in MSSQL.
