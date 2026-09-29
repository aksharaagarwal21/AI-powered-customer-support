# AI-Powered Customer Support · Frontend

The web client for an AI customer support system: a live chat, a ticket queue and support analytics.

## Features

- Chat with a support assistant, with an intent label and a sentiment meter for each conversation
- Escalation indicator for conversations that need a human agent
- Ticket list with filters and ticket updates
- Customer satisfaction (CSAT) rating after a conversation
- Dashboard and analytics pages

> This repository contains only the frontend. It expects a support API at `http://localhost:3001` (requests to `/api` are forwarded there), which is not included here.

## Tech stack

React · Vite · React Router · Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```
