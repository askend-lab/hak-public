
# EKI storybook

Storybook is installed on vanilla HTML with Typescript project.
Project uses Vite for dev server and project building.

## Install

```
npm install
```

## Portforward for VS Code when using Remote Development

Get Zone.ee's local loopback IP with following command
```bash
vs-loopback-ip -4
```

Example response:
`127.1.207.136`

If using some other server then `127.0.0.1` will probably be fine

Add port forwarding entries for port `5173` and `6006`

Example:
```bash
127.1.207.136:5173 -> localhost:5173
127.1.207.136:6006 -> localhost:6006
```

## Running storybook

```bash
npm run storybook
```

Running on storybook on seperate port.
Example running on port `6007`
```bash
npx storybook dev -p 6007
```

## Running project

```bash
npm run dev
```

## Storybook install

This part is written for future reference

```bash
npm create vite@latest my-html-app -- --template vanilla-ts
cd my-html-app
npm install
npx storybook@latest init
```
