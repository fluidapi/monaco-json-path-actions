# @fluidapi/monaco-json-path-actions-json-pointer

JSON Pointer formatter add-on for `@fluidapi/monaco-json-path-actions`.

## Install

```bash
npm install @fluidapi/monaco-json-path-actions @fluidapi/monaco-json-path-actions-json-pointer
```

## Usage

```ts
import {
  createJsonPathAction,
  registerJsonPathActions
} from '@fluidapi/monaco-json-path-actions'
import { createJsonPointerPathAction } from '@fluidapi/monaco-json-path-actions-json-pointer'

const disposable = registerJsonPathActions(editor, {
  actions: [
    createJsonPathAction(),
    createJsonPointerPathAction()
  ],
  copyText: (text) => navigator.clipboard.writeText(text)
})
```
