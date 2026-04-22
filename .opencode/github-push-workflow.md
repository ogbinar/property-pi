# GitHub Deployment Workflow

## Automated GitHub Push Process

When deploying projects to GitHub, follow this workflow:

### 1. Check for Existing Remote
```bash
git remote -v
```

### 2. If No Remote Exists, Create GitHub Repository

**Option A: Using GitHub CLI (Recommended)**
```bash
# Create repo and push in one command
gh repo create <owner>/<repo-name> --public --description "<description>" --source=. --remote=origin --push

# Or create without pushing
gh repo create <owner>/<repo-name> --public --description "<description>"
```

**Option B: Manual Creation**
1. Go to https://github.com/new
2. Create empty repository (no README)
3. Add remote: `git remote add origin https://github.com/<owner>/<repo-name>.git`
4. Push: `git push -u origin master` (or `main`)

### 3. If Remote Already Exists
```bash
# Update remote URL if needed
git remote set-url origin https://github.com/<owner>/<repo-name>.git

# Push to remote
git push -u origin <branch>
```

### 4. Common Scenarios

**First-time push:**
```bash
git add -A
git commit -m "Initial commit"
gh repo create owner/repo-name --public --description "..." --source=. --remote=origin --push
```

**Subsequent pushes:**
```bash
git add -A
git commit -m "Your commit message"
git push origin master
```

**Force push (use carefully):**
```bash
git push -f origin master
```

### 5. Authentication

GitHub CLI (`gh`) requires authentication:
```bash
gh auth login
```

For git over HTTPS, you may need a personal access token:
```bash
git config --global credential.helper store
```

### 6. Best Practices

- **Always commit before pushing**
- **Use descriptive commit messages**
- **Push to correct branch** (master/main)
- **Don't push sensitive files** (check .gitignore)
- **Verify push succeeded** with `git status`

### 7. Troubleshooting

**"Repository not found"**
- Repository doesn't exist - create it first
- Check spelling of owner/repo-name
- Verify you have permissions

**"Authentication failed"**
- Run `gh auth login`
- Check personal access token permissions

**"Remote origin already exists"**
- Run `git remote set-url origin <new-url>`

**"Branch protection rules"**
- You may need to create a PR instead of direct push
- Check repository settings for branch rules

## Quick Reference

| Command | Purpose |
|---------|---------|
| `gh repo create owner/repo --public --source=. --remote=origin --push` | Create + push |
| `git push -u origin master` | First push to new remote |
| `git push origin master` | Subsequent pushes |
| `git remote -v` | Check remotes |
| `git remote set-url origin <url>` | Update remote URL |

## Example: Complete Workflow

```bash
# 1. Stage all changes
git add -A

# 2. Commit with message
git commit -m "Add new feature"

# 3. Create GitHub repo and push
gh repo create myorg/myproject --public --description "My project" --source=. --remote=origin --push

# 4. Verify
git status
# Should show: "Your branch is up to date with 'origin/master'"
```
