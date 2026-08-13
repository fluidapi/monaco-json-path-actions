# @fluidapi/monaco-json-path-actions-go-template

Go Template formatter add-on for `@fluidapi/monaco-json-path-actions`.

## Install

```bash
npm install @fluidapi/monaco-json-path-actions @fluidapi/monaco-json-path-actions-go-template
```

## Usage

```ts
import {
  createJsonPathAction,
  registerJsonPathActions
} from '@fluidapi/monaco-json-path-actions'
import { createGoTemplatePathAction } from '@fluidapi/monaco-json-path-actions-go-template'

const disposable = registerJsonPathActions(editor, {
  actions: [
    createJsonPathAction({ label: 'Copy JSON Path' }),
    createGoTemplatePathAction({ label: 'Copy Go Template Path' })
  ],
  copyText: (text) => navigator.clipboard.writeText(text)
})
```
