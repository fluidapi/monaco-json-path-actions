import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import {
  createJsonPathAction,
  registerJsonPathActions
} from '@fluidapi/monaco-json-path-actions'
import { createGoTemplatePathAction } from '@fluidapi/monaco-json-path-actions-go-template'
import { createJqPathAction } from '@fluidapi/monaco-json-path-actions-jq'
import { createJsonPointerPathAction } from '@fluidapi/monaco-json-path-actions-json-pointer'
import './styles.css'

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'json') return new jsonWorker()

    return new editorWorker()
  }
}

const editorElement = document.querySelector<HTMLDivElement>('#editor')
const copiedOutput = document.querySelector<HTMLOutputElement>('#copied-output')

if (!editorElement || !copiedOutput) {
  throw new Error('Example DOM was not initialized')
}

const initialValue = `{
  "customer": {
    "name": "Acme",
    "orders": [
      {
        "id": 123,
        "shipping-address": {
          "city": "Florianopolis"
        }
      }
    ]
  },
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "with space": true,
  "quote\\"inside": "ok"
}
`

const editor = monaco.editor.create(editorElement, {
  value: initialValue,
  language: 'json',
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  tabSize: 2,
  theme: 'vs-dark'
})

const disposable = registerJsonPathActions(editor, {
  actions: [
    createJsonPathAction(),
    createJsonPointerPathAction(),
    createJqPathAction(),
    createGoTemplatePathAction()
  ],
  copyText: async (text) => {
    await navigator.clipboard.writeText(text)
  },
  onCopied: (text) => {
    copiedOutput.value = `Copied: ${text}`
  },
  onUnavailable: () => {
    copiedOutput.value = 'No JSON path at this position'
  },
  onCopyError: () => {
    copiedOutput.value = 'Could not copy to clipboard'
  }
})

window.addEventListener('beforeunload', () => {
  disposable.dispose()
  editor.dispose()
})
