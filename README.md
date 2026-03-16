# todo-desktop

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Auto Update + GitHub Release (Simple)

1. In `electron-builder.yml`, set `publish.owner` and `publish.repo` to your GitHub repo.
2. Create a GitHub personal access token with `repo` scope and set it in your shell:

```bash
$ set GH_TOKEN=your_github_token
```

3. Release `v1.0.0` from the commit where `package.json` is `1.0.0`:

```bash
$ git tag v1.0.0
$ git push origin v1.0.0
```

4. Release `v1.1.0` (this commit includes a visible title change):

```bash
$ git add .
$ git commit -m "feat: add updater and v1.1 visible change"
$ git tag v1.1.0
$ git push origin main --tags
$ npm run release:win
```

On app startup, Electron will check for updates and notify users when a new version is available.
