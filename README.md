# @fluidapi/monaco-json-path-actions

Monaco editor actions for copying the JSON path under the cursor from JSON and JSONC documents.

The package exposes pure path utilities and a small Monaco integration helper. It does not depend on React, toast libraries, app-specific i18n, or a clipboard abstraction.

## Install

```bash
npm install @fluidapi/monaco-json-path-actions
```

## Usage

```ts
import { registerJsonPathActions } from '@fluidapi/monaco-json-path-actions'

const disposable = registerJsonPathActions(editor, {
  labels: {
    jsonPath: 'Copy JSON Path',
    goTemplatePath: 'Copy Go Template Path'
  },
  copyText: (text) => navigator.clipboard.writeText(text),
  onCopied: (text) => console.info(`Copied: ${text}`),
  onUnavailable: () => console.warn('No JSON path at this position')
})

// Later, when the Monaco editor is disposed or recreated:
disposable.dispose()
```

The helper registers two context menu actions by default:

- `fluid.copy-json-path`
- `fluid.copy-go-template-path`

Actions are enabled for Monaco models whose language id is `json` or `jsonc`.

## Pure Utilities

```ts
import {
  getJsonPathAtOffset,
  formatJsonPath,
  formatGoTemplatePath
} from '@fluidapi/monaco-json-path-actions'

const path = getJsonPathAtOffset('{"customer":{"name":"Acme"}}', 15)

formatJsonPath(path!) // customer.name
formatGoTemplatePath(path!) // {{ .customer.name }}
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

Go Template output uses dot notation only when every property is safe for Go templates. Arrays and non-safe keys use `index`:

```ts
formatGoTemplatePath(['customer', 'name'])
// {{ .customer.name }}

formatGoTemplatePath(['customer', 'orders', 0, 'shipping-address', 'city'])
// {{ index . "customer" "orders" 0 "shipping-address" "city" }}

formatGoTemplatePath(['$schema'])
// {{ index . "$schema" }}
```

## API

### `getJsonPathAtOffset(value, offset, options?)`

Returns `Array<string | number> | null` for the JSON/JSONC node at an offset.

### `getJsonPathAtPosition(model, position, options?)`

Accepts a Monaco-like model with `getValue()` and `getOffsetAt(position)`.

### `formatJsonPath(path)`

Formats path parts as JavaScript-like property access.

### `formatGoTemplatePath(path)`

Formats path parts as a complete Go Template expression wrapped in `{{ ... }}`.

### `registerJsonPathActions(editor, options?)`

Registers context menu actions on a Monaco-like editor and returns a disposable.

Important options:

- `labels`: localized labels for each action.
- `copyText`: clipboard callback.
- `onCopied`: success callback.
- `onUnavailable`: called when no path can be resolved.
- `onCopyError`: called when `copyText` fails.
- `isEnabledForLanguage`: override language eligibility.
- `enabledFormats`: choose `jsonPath`, `goTemplatePath`, or both.

## Development

```bash
npm install
npm run validate
```
