PROJECT: SupportAssist KB Suggestions

CURRENT STATE
-------------
Working Gmail extension that suggests Zoho Desk KB articles.

Architecture:
Gmail Extension → Local Python AI server → Zoho Desk KB links

Server
------
kb_server.py running locally
http://127.0.0.1:8787

Routes:
GET /health
POST /suggest

Extension
---------
content.js runs inside Gmail.

It sends to AI:
- Subject
- Latest customer message
- Previous customer message

The AI scores KB articles and returns top 3 suggestions.

Example working thread:
1. All I see is a blank screen
2. Now it is asking for a login username and password
3. Now the movie streams are not working

Suggestion order currently:
1. Splash Player: Blank Screen Fix
2. Invalid Username or Password
3. Buffering or Freezing

NEXT STEP
---------
Improve keyword detection for phrases like:
- streams not working
- movies not working
- channels not working

Later improvements:
- thread stage detection
- deploy server to AWS Lightsail
- endpoint: supportassist.begoodvpn.com
