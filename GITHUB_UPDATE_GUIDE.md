GitHub Update Guide (ADHD Version)

If you forget how to update GitHub, follow these steps exactly.

Do not think. Just follow the steps.

Step 1 — Open Git CMD

Open Git CMD.

Step 2 — Go to the project folder

Type this:

cd C:\Users\New User\supportassist

Press Enter

Step 3 — See what changed

Type:

git status

Press Enter

This shows what files changed.

Step 4 — Add the changes

Type:

git add .

Press Enter

This prepares the files.

Step 5 — Save the change

Type:

git commit -m "describe what you changed"

Example:

git commit -m "added View button"

Press Enter

Step 6 — Send it to GitHub

Type:

git push

Press Enter

Now GitHub is updated.

The Only Commands You Need To Remember
git add .
git commit -m "message"
git push

That is the whole workflow.

Safety Rule

Before big changes make a checkpoint.

Example:

git commit -m "checkpoint before UI changes"

This lets you go back if something breaks.

Project Design Rules

Never break these rules:

Consistency
Simplicity
Predictability
Forgiveness
Recognition over Recall
One-Action Rule

If a feature breaks these rules → redesign it.

Ultra Short Version

If you forget everything else:

cd C:\Users\New User\supportassist
git add .
git commit -m "what changed"
git push

Done.
