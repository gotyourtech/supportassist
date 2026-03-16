SupportAssist – Return Point
If you forget where you left off

Read this file first.

This tells you exactly what the next step is.

Current System Status

The system is fully running and deployed.

Working flow:

Gmail
↓
Chrome Extension
↓
supportassist.begoodvpn.com
↓
NGINX
↓
AI Server (systemd service)
↓
KB suggestions returned
↓
feedback.jsonl logging

Server health test:

https://supportassist.begoodvpn.com/health

Expected result:

{"articles":10,"status":"ok"}
Project Design Philosophy (Locked)
Consistency
Simplicity
Predictability
Forgiveness
Recognition over Recall
One-Action Rule

All future UI changes must follow these rules.

Current Interface

Each suggestion shows:

Article Title
Confidence: HIGH

INSERT   VIEW   COPY

Rules:

INSERT = main action
VIEW = confirm article
COPY = manual use

Maximum 3 visible actions.

Next Feature To Build

Add View Article button to the extension panel.

Goal:

Allow Robert to quickly confirm the article before inserting it.

Target layout:

Article Title

[ INSERT ]   View   Copy
Files That Will Be Modified

Extension UI files:

extension/panel.html
extension/content.js
Next Development Step

Open:

C:\Users\New User\supportassist\extension\panel.html

Add the View button beside the Insert button.

Reminder

The goal of this system is:

Robert must love using it.
Robert must feel in control.
The tool must feel obvious.

If the interface makes Robert think, redesign it.

Restart Procedure

If returning after time away:

Open project folder

C:\Users\New User\supportassist

Open extension files

extension/

Continue UI improvements starting with:

panel.html
Mental Model

The extension panel is a remote control.

Users should instantly know what to press.

Read email
↓
Click INSERT
↓
Send reply

No thinking required.
