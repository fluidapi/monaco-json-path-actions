# @fluidapi/monaco-json-path-actions

Extensible Monaco editor actions for copying the JSON path under the cursor from JSON and JSONC documents.

The core package exposes pure JSON path utilities and a small Monaco integration helper. It does not depend on React, toast libraries, app-specific i18n, or a clipboard abstraction. Formatters for standards, CLIs, and template languages live in optional add-on packages.

## Install

```bash
npm install @fluidapi/monaco-json-path-actions
```

Optional add-ons:

```bash
npm install @fluidapi/monaco-json-path-actions-json-pointer
npm install @fluidapi/monaco-json-path-actions-jq
npm install @fluidapi/monaco-json-path-actions-go-template
```

## Usage

```ts
import {
  createJsonPathAction,
  registerJsonPathActions
} from '@fluidapi/monaco-json-path-actions'

const disposable = registerJsonPathActions(editor, {
  actions: [
    createJsonPathAction({ label: 'Copy JSON Path' })
  ],
  copyText: (text) => navigator.clipboard.writeText(text),
  onCopied: (text) => console.info(`Copied: ${text}`),
  onUnavailable: () => console.warn('No JSON path at this position')
})

// Later, when the Monaco editor is disposed or recreated:
disposable.dispose()
```

`registerJsonPathActions(editor)` registers `fluid.copy-json-path` by default. Actions are enabled for Monaco models whose language id is `json` or `jsonc`.

## Add-On Actions

Additional actions can be passed through the same `actions` option.

```ts
import {
  createJsonPathAction,
  registerJsonPathActions
} from '@fluidapi/monaco-json-path-actions'
import { createJsonPointerPathAction } from '@fluidapi/monaco-json-path-actions-json-pointer'
import { createJqPathAction } from '@fluidapi/monaco-json-path-actions-jq'
import { createGoTemplatePathAction } from '@fluidapi/monaco-json-path-actions-go-template'

const disposable = registerJsonPathActions(editor, {
  actions: [
    createJsonPathAction({ label: 'Copy JSON Path' }),
    createJsonPointerPathAction({ label: 'Copy JSON Pointer' }),
    createJqPathAction({ label: 'Copy jq Path' }),
    createGoTemplatePathAction({ label: 'Copy Go Template Path' })
  ],
  copyText: (text) => navigator.clipboard.writeText(text)
})
```

Custom actions only need an id, label, and formatter:

```ts
registerJsonPathActions(editor, {
  actions: [
    {
      id: 'copy-python-path',
      label: 'Copy Python Path',
      formatter: (path) => `data${path.map((part) => `[${JSON.stringify(part)}]`).join('')}`
    }
  ]
})
```

## Pure Utilities

```ts
import {
  getJsonPathAtOffset,
  formatJsonPath
} from '@fluidapi/monaco-json-path-actions'

const path = getJsonPathAtOffset('{"customer":{"name":"Acme"}}', 15)

formatJsonPath(path!) // customer.name
```

## Formatting Rules

JSON path output uses JavaScript-like property access:

```ts
formatJsonPath(['customer', 'orders', 0, 'id'])
// customer.orders[0].id

formatJsonPath(['shipping-address'])
// ["shipping-address"]

formatJsonPath(['$schema'])
// $schema
```

JSON Pointer output is provided by `@fluidapi/monaco-json-path-actions-json-pointer`:

```ts
import { formatJsonPointerPath } from '@fluidapi/monaco-json-path-actions-json-pointer'

formatJsonPointerPath(['customer', 'orders', 0, 'id'])
// /customer/orders/0/id

formatJsonPointerPath(['slash/inside', 'tilde~inside'])
// /slash~1inside/tilde~0inside
```

jq output is provided by `@fluidapi/monaco-json-path-actions-jq`:

```ts
import { formatJqPath } from '@fluidapi/monaco-json-path-actions-jq'

formatJqPath(['customer', 'orders', 0, 'id'])
// .customer.orders[0].id

formatJqPath(['shipping-address'])
// .["shipping-address"]
```

Go Template output is provided by `@fluidapi/monaco-json-path-actions-go-template`:

```ts
import { formatGoTemplatePath } from '@fluidapi/monaco-json-path-actions-go-template'

formatGoTemplatePath(['customer', 'name'])
// {{ .customer.name }}

formatGoTemplatePath(['customer', 'orders', 0, 'shipping-address', 'city'])
// {{ index . "customer" "orders" 0 "shipping-address" "city" }}
```

## API

### `getJsonPathAtOffset(value, offset, options?)`

Returns `Array<string | number> | null` for the JSON/JSONC node at an offset.

### `getJsonPathAtPosition(model, position, options?)`

Accepts a Monaco-like model with `getValue()` and `getOffsetAt(position)`.

### `formatJsonPath(path)`

Formats path parts as JavaScript-like property access.

### `createJsonPathAction(overrides?)`

Creates the default JSON path Monaco action definition.

### `registerJsonPathActions(editor, options?)`

Registers context menu actions on a Monaco-like editor and returns a disposable.

Important options:

- `actions`: custom action definitions. Defaults to `Copy JSON Path`.
- `copyText`: clipboard callback.
- `onCopied`: success callback.
- `onUnavailable`: called when no path can be resolved.
- `onCopyError`: called when `copyText` fails.
- `isEnabledForLanguage`: override language eligibility.
- `contextMenuGroupId`, `contextMenuOrder`, `precondition`: Monaco action defaults.

## Development

```bash
npm install
npm run validate
```
