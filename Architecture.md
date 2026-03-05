---

## 3A) Account ownership (very important)

All services for this system are tied to the **BeGoodVPN infrastructure accounts**, not personal accounts.

Primary service account identity:
- begoodvpn

This account is used across multiple systems.

### Gmail / Chrome
- Gmail account: begoodvpn
- Chrome profile used for testing: begoodvpn Gmail account
- The Chrome extension runs inside this Gmail account environment.

Location:
- chrome://extensions
- Extension loaded from local folder:
  C:\Users\New User\supportassist\extension

### AWS Lightsail (future deployment)
Account: begoodvpn

Purpose:
- Host the AI scoring server in production
- Replace local server:
  http://127.0.0.1:8787

Future endpoint:
- https://supportassist.begoodvpn.com

### OpenAI
Account: begoodvpn

Purpose:
- Future AI assistance for:
  - KB matching
  - natural language understanding
  - support automation

Currently:
- local keyword scoring engine in Python
- OpenAI integration planned later

### Zoho Desk
Account: begoodvpn

Purpose:
- Stores Knowledge Base articles
- AI suggestions point to these articles

Example:
- https://begoodiptvvpnservices.zohodesk.com/portal/en/kb/

---

IMPORTANT DESIGN RULE

All infrastructure belongs to **BeGoodVPN**, not Bruce personally.

Reason:
- Business continuity
- Robert control
- Production deployment later

Local development environment (Bruce):
- Windows machine
- Local Python server
- Chrome extension testing
