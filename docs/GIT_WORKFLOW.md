# Git workflow for the team (never push directly to `main`)

## One-time setup
```bash
git clone <repo-url> && cd <repo>
git config user.name "Your Name" && git config user.email "you@example.com"
```
Make sure `node_modules/` and `dist/` are in `.gitignore`.

## Every change, step by step
```bash
git checkout main && git pull origin main          # 1. start from the latest main
git checkout -b feature/short-description          # 2. one branch per task
# ... edit files, run `npm run dev` and `npm run build` ...
git status && git add -A                           # 3. review what changed
git commit -m "Add registration details and password toggle"
git push -u origin feature/short-description       # 4. push the BRANCH, not main
```
5. Open GitHub, click **Compare & pull request**, describe the change, and request a review from a teammate.
6. After approval, click **Squash and merge**, then delete the branch.
7. Everyone updates: `git checkout main && git pull origin main`.

## Keep your branch up to date while others merge
```bash
git fetch origin
git rebase origin/main        # or: git merge origin/main
# fix any conflicts, then: git add <files> && git rebase --continue
git push --force-with-lease   # only needed after a rebase, only on YOUR branch
```

## Protect `main` (repository owner, once)
GitHub: **Settings -> Branches -> Add branch protection rule** for `main`: require a pull request before merging, require at least 1 approval, and block force pushes. After this, direct pushes to `main` are rejected.

## If main already contains the old frontend and you want to add the new version
```bash
git checkout main && git pull origin main
git checkout -b feature/ui-redesign-v2
# replace the contents of the project folder with the new files (keep the .git folder)
git add -A && git commit -m "Redesign UI: new shell, roles, registration details"
git push -u origin feature/ui-redesign-v2
```
Then open a pull request into `main`.

## If you committed to local `main` by mistake (not pushed yet)
```bash
git branch feature/my-work        # keep the commits on a new branch
git reset --hard origin/main      # put local main back
git checkout feature/my-work && git push -u origin feature/my-work
```

## Good habits
Small pull requests, clear commit messages, pull before you start, never commit passwords or `node_modules`, and tell the team in chat before touching shared files such as `useStore.js` or `theme.css`.
