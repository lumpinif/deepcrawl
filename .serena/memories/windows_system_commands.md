# Windows System Commands - DeepCrawl

## File System Operations
```cmd
# Directory listing
dir                       # List directory contents (Windows native)
ls                        # Also available (if using Git Bash/WSL)

# Navigation
cd path\to\directory      # Change directory (use backslashes on Windows)
cd apps\workers\v0        # Example navigation

# File operations  
type file.txt             # Display file contents (Windows native)
cat file.txt              # Also available (Git Bash/WSL)
copy source dest          # Copy files (Windows native)
move source dest          # Move files (Windows native)

# Search
findstr "pattern" *.ts    # Search in files (Windows native)
grep "pattern" *.ts       # Also available (Git Bash/WSL)
```

## Git Operations
```bash
git status                # Working tree status
git add .                 # Stage all changes
git commit -m "message"   # Commit changes
git push                  # Push to remote
git pull                  # Pull from remote
git branch                # List branches
git log --oneline         # Compact commit history
```

## Node.js/pnpm Commands
```bash
# Package management
pnpm install              # Install dependencies
pnpm add package          # Add package
pnpm remove package       # Remove package
pnpm list                 # List installed packages

# Script execution
pnpm run script           # Run package.json script
npx command               # Run package binary
node file.js              # Run JavaScript file
tsx file.ts               # Run TypeScript file directly
```

## Process Management
```cmd
# Windows native
tasklist                  # List running processes
taskkill /PID process_id  # Kill process by PID
taskkill /F /IM name.exe  # Force kill by image name

# Alternative (PowerShell/Git Bash)
ps                        # List processes
kill PID                  # Kill process
```

## Environment Variables
```cmd
# Windows CMD
set VAR_NAME=value        # Set environment variable
echo %VAR_NAME%           # Display variable

# PowerShell  
$env:VAR_NAME = "value"   # Set environment variable
echo $env:VAR_NAME        # Display variable
```

## Network & Ports
```cmd
netstat -an               # List network connections
netstat -ano | findstr :8080  # Find process using port 8080
```

## Path Conventions
- Use backslashes `\` for Windows paths in commands
- Forward slashes `/` work in many contexts (Git Bash, Node.js)
- Always use backslashes for `cd` commands in Windows CMD