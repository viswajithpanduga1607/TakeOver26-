# Verdikt AI

**Team:** Tech Resolutions
**Team ID:** FTS.19
**Hackathon:** TakeOver'26
**Theme:** Theme 2 — AI Automation & Intelligent Agents

---

## Project Overview

Verdikt AI is an autonomous approval and task-routing agent. Employees submit requests (leave, expense, or complaint) through a web form. An AI agent (powered by Google Gemini, orchestrated via n8n) reads and evaluates each request, makes an autonomous decision — **AUTO_APPROVE**, **NEEDS_REVIEW**, or **REJECT** — with a clear one-line reason, logs it, and automatically notifies the relevant manager by email. The user also receives instant confirmation on-screen, including confirmation that the manager has been notified.

### Core Value Proposition

Removes manual bottlenecks in approval workflows by letting AI make first-pass decisions with transparent reasoning, instead of requests sitting in someone's inbox waiting for manual review.

---

## Problem Statement

**Autonomous Workflow Agents** — *"Businesses lack intelligent systems that can automatically execute multi-step workflows involving multiple departments and approvals."*

---

## Tech Stack

| Layer                  | Technology                                                                 |
| ---------------------- | -------------------------------------------------------------------------- |
| **Backend/Orchestration** | n8n (hosted on college-provided instance, `workflow.ccbp.in`)            |
| **AI Model**           | Google Gemini (via AI Agent node in n8n)                                   |
| **Frontend**           | HTML / JavaScript (to be deployed via Vercel)                              |
| **Data Logging**       | Google Sheets (via OAuth-authenticated Google Sheets API)                  |
| **Notifications**      | Gmail API (via OAuth-authenticated Gmail node)                             |
| **Auth Setup**         | Google Cloud Console project — OAuth consent screen (External, test user mode), Sheets API + Gmail API enabled, OAuth Client ID/Secret connected to n8n credentials |

---

## Architecture / Workflow

The backend workflow is fully built and operational in n8n. The pipeline is as follows:

```
Frontend Form  ──POST JSON──▸  n8n Webhook
                                    │
                              AI Agent (Gemini)
                              Evaluates request, outputs structured JSON:
                              { employeeName, requestType, description,
                                decision, reason, timestamp }
                                    │
                              Edit Fields (Set Node)
                              Parses AI text output into individual fields
                                    │
                              Google Sheets (Append Row)
                              Logs request + decision + reason + timestamp
                                    │
                              Switch Node
                        ┌───────────┼───────────┐
                   AUTO_APPROVE  NEEDS_REVIEW   REJECT
                        │           │            │
                   Gmail Node    Gmail Node   Gmail Node
                   (approve      (review      (reject
                    email)        email)       email)
                        └───────────┼───────────┘
                                    │
                          Respond to Webhook
                          Returns JSON to frontend:
                          { decision, reason, managerNotified }
```

### Workflow Nodes (Detail)

1. **Webhook Node** — Receives POST requests from the frontend. Publicly reachable; tested via both Test URL and Production URL. CORS is handled.
2. **AI Agent Node** — Gemini-powered. Evaluates the request using a structured system prompt. Outputs JSON with `employeeName`, `requestType`, `description`, `decision`, `reason`, and `timestamp`.
3. **Edit Fields (Set) Node** — Parses the AI Agent's JSON text output into individual structured fields for downstream nodes.
4. **Google Sheets Node** — Append Row operation. Logs every request along with the AI decision, reasoning, and timestamp to a spreadsheet.
5. **Switch Node** — Routes based on the `decision` field into three branches: `AUTO_APPROVE`, `NEEDS_REVIEW`, `REJECT`.
6. **Gmail Nodes (×3)** — One per branch. Sends a manager notification email with subject/body reflecting the specific decision and reasoning, for all three outcomes including rejection.
7. **Respond to Webhook Node** — Merges all three branches. Sends the final JSON response back to the frontend containing `decision`, `reason`, and a confirmation message that the manager was notified.

### Note on Memory

A Memory node (Simple/Window Buffer Memory) was considered but **not implemented** in this version due to time constraints and lack of availability on the current n8n instance. Every AI Agent call is fully self-contained (no persistent memory); all context is passed explicitly per request. This is flagged as a **planned Level 2 enhancement**.

---

## Current Status

| Component          | Status        |
| ------------------ | ------------- |
| n8n Webhook        | ✅ Complete    |
| AI Agent (Gemini)  | ✅ Complete    |
| Edit Fields / Set  | ✅ Complete    |
| Google Sheets Log  | ✅ Complete    |
| Switch Routing     | ✅ Complete    |
| Gmail Notifications| ✅ Complete    |
| Respond to Webhook | ✅ Complete    |
| **Frontend (Web Form)** | ✅ Complete |
| **Vercel Deployment**   | ✅ Complete |

---

## Planned Features (Level 2)

These are stretch goals for future rounds if selected:

- **Manager Dashboard** — A manager-facing interface to view Google Sheet data directly in-app.
- **Persistent Agent Memory** — Implement memory across requests for context-aware decisions.
- **Animated Intro / Branding** — Custom animated intro/branding sequence for the frontend.
