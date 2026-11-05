# SpendWise

Offline-first personal finance desktop application developed as a college group project.

SpendWise is designed for one user on one computer to track income and expenses, calculate balances, and analyze category-wise spending patterns without requiring any external bank connections or payment processors.

---

## Project Structure

```text
SpendWise/
└── backend/     # Express.js REST API and Prisma backend
```

- **Backend:** Node.js, Express.js, Prisma Client (PostgreSQL) — see [`backend/README.md`](./backend/README.md) for full API documentation and setup instructions.

---

## Getting Started

To run the backend server:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Run tests:
```bash
cd backend
npm test
```
