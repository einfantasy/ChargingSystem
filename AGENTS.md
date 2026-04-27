# ChargingSystem - Agent Instructions

## Architecture

**ASP.NET Core 10.0 SPA** — Backend (`ChargingSystem.Server/`) + React frontend (`chargingsystem.client/`).

- **Solution**: `ChargingSystem.sln` (single Server project; Client referenced via `SpaProxy`)
- **Database**: SQLite at `ChargingSystem.Server/Database/app.db` (EF Core, no migrations used — database file is committed)
- **Auth**: JWT Bearer, 30 min expiry, config in `appsettings.json` → `JwtSettings`
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind 4, served through SPA Proxy in dev

## Development Commands

All commands run from repo root `ChargingSystem/` unless noted.

| Action | Command |
|--------|---------|
| Run full app (server + SPA proxy) | `dotnet run --project ChargingSystem.Server` |
| API server only | `dotnet run --project ChargingSystem.Server --urls "http://0.0.0.0:5126"` |
| Frontend dev server standalone | `cd chargingsystem.client && npm run dev` (proxies `/api` → `localhost:5126`) |
| Frontend build | `cd chargingsystem.client && npm run build` |
| Frontend lint | `cd chargingsystem.client && npm run lint` |
| Frontend typecheck | `cd chargingsystem.client && tsc -b` |
| Publish server | `dotnet publish ChargingSystem.Server -c Release` |

### Ports

- API: `http://0.0.0.0:5126` (see `launchSettings.json`)
- Vite dev server: `51137` (see `vite.config.ts`, overridable via `DEV_SERVER_PORT`)
- SPA Proxy forwards to Vite on `https://localhost:51137` in `csproj`

### First-Time Setup

```bash
# Install frontend dependencies
cd chargingsystem.client
npm install

# Run the app (SPA Proxy handles frontend dev server launch)
cd ..
dotnet run --project ChargingSystem.Server
```

## Key Conventions

- **Models** live in `ChargingSystem.Server/Model/` — plain POCOs with `[Key]` attributes, no Fluent API
- **Services** live in `ChargingSystem.Server/Service/` — registered as `Scoped` in `Program.cs`
- **Controllers** live in `ChargingSystem.Server/Controllers/` — DTOs defined inline in controller files
- **No migrations** — the `app.db` file is checked in and copied to output via `<CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>`
- **Seeding**: Default admin user (`admin` / `admin123`) is seeded on startup in `Program.cs` lines 47-50 if `Users` table is empty
- **Password hashing**: `PasswordService` handles hashing/verification

## API Structure

All endpoints prefixed `/api/[controller]`. Most require `[Authorize]` (JWT Bearer).

| Controller | Key Endpoints |
|------------|---------------|
| `Auth` | `POST /api/auth/login`, `POST /api/auth/change-password`, `POST /api/auth/refresh` |
| `Student` | Student CRUD |
| `Teacher` | Teacher CRUD |
| `Recharge` | `POST /api/recharge/add`, `GET /api/recharge/query?studentId=` |
| `Consume` | Consumption records |
| `Util` | Utility operations |

## Deployment

`ChargingSystem.Server/Deploy.ps1` — PowerShell script using plink/pscp (PuTTY):
1. Publishes with `dotnet publish -c Release`
2. Cleans remote dir at `192.168.2.50:/home/ein/Documents/ChargingSystem/`
3. Uploads via `pscp`
4. Restarts `chargingsystem` systemd service

**Warning**: Deploy script contains hardcoded credentials. Do not commit credential changes.

## Gotchas

- The database file (`Database/app.db`) is **committed to git** — schema changes require updating the file directly or running with a fresh DB
- The `app.db` path in connection string is relative: `./Database/app.db` — resolves relative to working directory (the Server project folder)
- SPA Proxy is enabled via `ASPNETCORE_HOSTINGSTARTUPASSEMBLIES` env var in `launchSettings.json`
- The Vite dev server proxies `/api` and `/weatherforecast` to `http://localhost:5126` when run standalone
- `WeatherForecastController.cs` appears to be a leftover template file — safe to ignore or remove
