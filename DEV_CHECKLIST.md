SupportAssist – Development Checklist

Use this checklist every time you modify the extension or server.

Follow the steps in order.

1. Save Work to GitHub

Open Git CMD and run:

cd C:\Users\New User\supportassist
git add .
git commit -m "describe change"
git push

This protects your work.

2. Reload Chrome Extension

Open Chrome and go to:

chrome://extensions

Then:

Developer Mode → ON

Click:

Reload

for the SupportAssist extension.

3. Test Panel Opens

Open Gmail.

Press:

Z

Expected result:

AI Suggestions panel opens
4. Test Suggestion Engine

Open a test email with text like:

I turn on my stick and there are no channels showing

Expected result:

App Opens but Empty (No Channels Found)
Confidence: HIGH
5. Test Insert Link

Click:

INSERT

Expected result:

KB article link appears in reply
6. Test Feedback Logging

SSH into the server and run:

tail ~/supportassist/feedback.jsonl

Expected result:

customer message
correct article logged
7. Test Server Health

Run:

curl https://supportassist.begoodvpn.com/health

Expected result:

{"articles":10,"status":"ok"}
8. If Something Breaks

Restart the AI service:

sudo systemctl restart supportassist

Check status:

sudo systemctl status supportassist
Philosophy Reminder

All changes must respect this design doctrine:

Consistency
Simplicity
Predictability
Forgiveness
Recognition over Recall
One-Action Rule

The panel is a remote control.

Users must instantly know what to press.

Goal

The workflow should always feel like this:

Read email
↓
Click INSERT
↓
Send reply

No thinking required.

If You Forget Everything

Run these checks:

chrome://extensions → Reload
Press Z in Gmail
curl https://supportassist.begoodvpn.com/health