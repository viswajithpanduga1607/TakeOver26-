# Execution Proofs

This document provides visual proof and detailed explanations of the Verdikt AI backend workflow executing successfully from start to finish.

## 1. n8n Workflow Execution
The n8n workflow orchestrates the entire process autonomously. The nodes involved and their functions are:
* **Webhook:** Receives the POST request containing the employee's submission (Name, Request Type, Description, Context) directly from the frontend.
* **AI Agent (Google Gemini Chat Model):** Evaluates the request using the Gemini model, outputting a structured JSON response with a `Decision` (AUTO_APPROVE, NEEDS_REVIEW, or REJECT) and a `Reason`.
* **Append row in sheet:** Logs the incoming request details, the AI's decision, reason, and a timestamp into our Google Sheets database.
* **Switch:** Routes the workflow into one of three distinct branches based on the AI's decision.
* **Send a message (Gmail nodes):** Depending on the switch routing, one of three Gmail nodes is triggered to automatically notify the relevant manager with the request details and the AI's assessment.
* **Respond to Webhook:** Merges the branches and sends the final JSON response (decision, reason, and confirmation message) back to the frontend to be displayed to the user.

**Execution Result:** The workflow successfully processed a request that was evaluated by the AI and routed to the `NEEDS_REVIEW` branch. The logs show the `Send a message1` (Gmail) node executing successfully in ~1.022s and returning a valid thread ID.

![n8n Workflow Execution](assets/n8n_execution.png)

## 2. Google Sheets Database Log
The request details and the AI's decision were successfully logged into the Google Sheets database immediately after the AI evaluation. 
The spreadsheet captures: `Name`, `RequestType`, `Description`, `Decision`, `Reason`, and `Timestamp`. 
For this execution, it correctly logged the `NEEDS_REVIEW` decision along with the AI's reason: *"Incomplete request: request type and description are missing."*

**Database Link (Proof):** [Verdikt AI Database - Google Sheets]
**[https://docs.google.com/spreadsheets/d/1RiJV51MX3IHL7jpxgjoB1Bzny_3gdD4Ol286ZIM_zDI/edit?usp=sharing]**
![Google Sheets Database Log](assets/sheets_log.png)

## 3. Manager Email Notification
The final step of the workflow successfully sent an automated email to the manager. The email correctly pulled the AI's assessment and displayed it in the body:
> "'s request needs your review. AI's Assessment: Incomplete request: request type and description are missing."

![Manager Email Notification](assets/email_notification.png)

This confirms the end-to-end pipeline is fully operational: **Frontend → n8n Webhook → Gemini AI → Google Sheets → Gmail → Frontend Response.**

---

*(Note: If the above execution proof images are not displaying properly, please check this Google Drive link for all raw screenshots and proof of work: **[https://drive.google.com/drive/folders/1xT5mXyqgLY04RpU1d2ni52iT6gsryyhw?usp=sharing]**)*
