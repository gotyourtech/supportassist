RETURN SEQUENCE

1. Read SYSTEM_MAP.md
2. Read CHECKPOINT.md
3. Start server
4. Open Gmail
5. Test suggestion panel

# SupportAssist System Map (15-second brain reload)

If returning to this project after time away,
read this page first.

---

## The Goal

Help Robert answer support emails faster by automatically suggesting the correct Zoho Desk knowledge-base article.

Customer email → AI → suggested fix → send link.

---

## The System (simple)

Customer Email
        ↓
Gmail (BeGoodVPN account)
        ↓
Chrome Extension
        ↓
Local AI Server (Python)
        ↓
Zoho Desk Knowledge Base
        ↓
Suggested Fix Links

---

## Accounts Used

Gmail
Account: begoodvpn
Used for:
- support emails
- Chrome extension testing

AWS Lightsail
Account: begoodvpn
Used for:
- future production AI server

OpenAI
Account: begoodvpn
Used for:
- future language understanding

Zoho Desk
Account: begoodvpn
Used for:
- Knowledge Base articles

---

## Code Locations

GitHub Repo
https://github.com/gotyourtech/supportassist

Structure

supportassist
├ extension
│  ├ content.js
│  └ manifest.json
├ server
│  └ kb_server.py
├ CHECKPOINT.md
├ CHANGELOG.md
├ ARCHITECTURE.md
└ SYSTEM_MAP.md

---

## Local Machine

Working folder

C:\Users\New User\supportassist

Server location

server/kb_server.py

Chrome extension folder

extension/

---

## How It Runs

Start server

PowerShell

cd C:\Users\New User\supportassist\server
python kb_server.py

Server URL

http://127.0.0.1:8787

---

## Gmail Extension

Runs in Gmail

chrome://extensions

Loaded from:

C:\Users\New User\supportassist\extension

Panel shows:

- Suggest Articles
- Insert Link
- Copy Link

---

## Data Flow

Email subject
+
Latest customer message
+
Previous customer message

↓ sent to

AI scoring engine

↓ returns

Top 3 Zoho Desk articles

---

## Example

Customer thread

1 blank screen
2 login username/password
3 streams not working

Suggestions

1 Splash Player Blank Screen Fix
2 Invalid Username or Password
3 Buffering / Freezing

---

## Current Version

v0.1

Working MVP.

---

## Next Improvement

Teach AI to understand phrases like

streams not working  
movies not working  
channels not working
