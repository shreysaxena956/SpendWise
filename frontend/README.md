# SpendWise frontend

The SpendWise React frontend is built with Vite. It includes an overview dashboard, income and expense tracking, transaction search and filters, monthly reports, and category spending visualizations.

## Run locally

```bash
npm install
npm run dev
```

In development, the frontend sends `/api` requests through Vite's same-origin proxy. The proxy targets `http://127.0.0.1:5001` by default. On macOS, port 5000 may be occupied by AirPlay Receiver; run the backend on port 5001 to avoid that conflict:

```bash
cd backend
PORT=5001 npm run dev
```

To proxy to a different backend port, set `VITE_API_PROXY_TARGET` in a frontend `.env` file. To bypass the dev proxy and use an API URL directly, set `VITE_API_BASE_URL`:

```env
VITE_API_PROXY_TARGET=http://127.0.0.1:5001
# Optional direct API URL; when set, use a full URL ending in /api.
VITE_API_BASE_URL=http://localhost:5001/api
```

The frontend uses the transactions, dashboard, categories, and reports endpoints documented in [`../backend/README.md`](../backend/README.md). Production assets can be generated with `npm run build`; `npm run lint` runs Oxlint.
