# @fluidapi/monaco-json-path-actions-jq

jq formatter add-on for `@fluidapi/monaco-json-path-actions`.

## Install

```bash
npm install @fluidapi/monaco-json-path-actions @fluidapi/monaco-json-path-actions-jq
```

## Usage

```ts
import {
  createJsonPathAction,
  registerJsonPathActions
} from '@fluidapi/monaco-json-path-actions'
import { createJqPathAction } from '@fluidapi/monaco-json-path-actions-jq'

const disposable = registerJsonPathActions(editor, {
  actions: [
    createJsonPathAction(),
    createJqPathAction()
  ],
  copyText: (text) => navigator.clipboard.writeText(text)
})
```
