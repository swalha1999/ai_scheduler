This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

install node and npm

```bash
# For Windows:
# Download and install Node.js 20.x from https://nodejs.org/

# For macOS using Homebrew:
brew install node@20

# For Ubuntu/Debian Linux:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# For other Linux distributions:
# Use your package manager to install nodejs-20.x

# Verify installation:
node --version
npm --version
```

after that install pnpm

```bash
npm install -g pnpm
```

after that we need to install gh cli
this will allow us to push to github and create a new pull request so we can deploy the app later to the server this is optional but very useful

```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
        && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y
```

now lets add explanation on some of the commands

### Development Commands

- `pnpm dev`: Starts the development server using Turbopack
- `pnpm build`: Creates a production build of the application
- `pnpm start`: Runs the production build
- `pnpm lint`: Runs linting checks on the codebase

### Database Commands

- `pnpm db:create`: Creates a PostgreSQL database container using Docker
- `pnpm db:push`: Pushes schema changes to the database
- `pnpm db:generate`: Generates database migrations
- `pnpm db:migrate`: Runs database migrations
- `pnpm db:studio`: Launches Drizzle Studio for database management on port 6969
- `pnpm db:start`: Starts the database container
- `pnpm db:stop`: Stops the database container
- `pnpm db:remove`: Stops and removes the database container
- `pnpm db:setup_clean`: Creates a new database and pushes the schema
- `pnpm db:setup`: Creates a new database, restores backup, and pushes schema changes

### Seeding Commands

- `pnpm seed`: Runs the script to seed the database

### Github Commands

when changing the codebase you need to create a new branch and push to it

```bash
git checkout -b <branch_name>
git add .
git commit -m "commit message"
git push origin <branch_name>
gh pr create --title "PR title" --body "PR body"

```

# to delete a branch

```bash
git branch -d <branch_name>
```

# to get the latest changes from the main branch to your branch

```bash
git checkout <branch_name>
git pull origin main
```

this will create a new pull request and you can merge it to the main branch in github and will give you a link to a preview of the branch will the changes you made

First, run the development server:

```bash
pnpm install
#after installing the dependencies run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
# estatemar
# ai_scheduler
