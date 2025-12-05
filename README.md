# globaltech-hmi

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

### Generar tipos (deviceId y parameterId)

```bash
$ npm run generate:types
```

Usa `config/devices.yaml` y `parameters.json` del backend para crear `src/renderer/src/types/generated/devices.ts`.
Puedes parametrizar la ruta del backend con `VITE_BACKEND_ROOT` (default: `../GlobalTech-Backend`).

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
