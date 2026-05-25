# Kaamil — Deploy Online (Vercel + Railway + Neon)

## Qaab dhismeedka

| Qayb | Goobta | Technology |
|------|--------|------------|
| Frontend | **Vercel** | React + Vite |
| Backend | **Railway** | ASP.NET 8 API |
| Database | **Neon** | PostgreSQL (online) |

---

## 1. Neon Database (PostgreSQL)

1. Gal [neon.tech](https://neon.tech) — project `neondb`
2. Copy **connection string** (Pooled):
   ```
   postgresql://neondb_owner:PASSWORD@ep-still-feather-aphg4h81-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Local dev: copy `backend/appsettings.Development.local.json.example` → `appsettings.Development.local.json` oo geli password-kaaga (ha commit-garin!)

### Migration (hal mar)

**Automatic (Railway):** Marka backend-ku bilaabmo, wuxuu `MigrateAsync()` ku sameeyaa tables Neon.

**Manual (local CMD):**
```cmd
cd backend
set DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-still-feather-aphg4h81-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
migrate-neon.cmd
```

Ama: `dotnet run` (iyadoo `DATABASE_URL` la dejiyay) — migration + admin seed isla mar.

---

## 2. Railway (Backend)

1. Gal [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Dooro repo `Kaamil`
3. **Settings → Root Directory** — dooro **mid**:
   - `backend` (recommended), **AMA**
   - madhan (repo root) — wuxuu isticmaalaa `Dockerfile` ee root-ka
4. **Settings → Build** → Builder: **Dockerfile**, path: `backend/Dockerfile` (ama `Dockerfile` haddii root madhan)
5. **Settings → Deploy → Custom Start Command** → **TIR** (madhan / delete) — ha isticmaalin `npm run start`!
   - Backend waa .NET, ma aha Node. Dockerfile `ENTRYPOINT` ayaa bilaabaya app-ka.
5. **Variables** (Settings → Variables):

| Variable | Qiime |
|----------|-------|
| `DATABASE_URL` | Neon connection string (oo dhan) |
| `JWT_KEY` | String random ah (32+ chars) |
| `Jwt__Key` | Isla JWT key |
| `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

4. Deploy → copy **Public URL** (tusaale `https://kaamil-api-production.up.railway.app`)
5. Hubi: fur `https://YOUR-RAILWAY-URL/health` → `{"status":"ok"}`

**Note:** Railway wuxuu si toos ah u dejiyaa `PORT`.

---

## 3. Vercel (Frontend)

1. Gal [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo
2. **Root Directory**: `frontend`
3. **Environment Variable**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | Railway URL (tusaale `https://kaamil-api-production.up.railway.app`) |

4. Deploy → copy Vercel URL (tusaale `https://kaamil.vercel.app`)
5. Ku celi Railway `CORS_ORIGINS` → geli Vercel URL saxda ah

---

## 4. Admin login (online)

```
Email:    admin@kaamil.com
Password: Admin@123
```

Seed-ka wuxuu abuuraa admin marka backend-ku bilaabmo (migration kadib).

---

## 5. Local development (offline frontend + online DB)

**Terminal 1 — Backend:**
```cmd
cd backend
set DATABASE_URL=postgresql://...
dotnet run
```

**Terminal 2 — Frontend:**
```cmd
cd frontend
npm run dev
```

Vite proxy `/api` → `localhost:5177` (haddii `VITE_API_URL` madhan yahay).

---

## 6. Troubleshooting

| Qalad | Xalka |
|-------|-------|
| Railway build failed | Root Directory = `backend`; Builder = Dockerfile; **tir** `npm run start` start command |
| Bad Gateway / 502 | Backend Railway ma socdo ama `VITE_API_URL` khalad |
| CORS error | `CORS_ORIGINS` ku dar Vercel URL saxda |
| Database error | Hubi `DATABASE_URL` Neon; run `migrate-neon.cmd` ama restart Railway |
| 401 login | Admin seed — hubi migration la apply gareeyay |

---

## Files muhiim ah

- `backend/.env.example` — Railway variables
- `frontend/.env.example` — Vercel `VITE_API_URL`
- `backend/railway.toml` — Railway config
- `frontend/vercel.json` — SPA routing
