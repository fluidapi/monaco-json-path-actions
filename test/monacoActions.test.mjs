import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createJsonPathAction,
  registerJsonPathActions
} from '../dist/index.js'
import { createGoTemplatePathAction } from '../packages/go-template/dist/index.js'

const createEditor = (value, offset, languageId = 'json') => {
  const actions = []
  const disposed = []
  const editor = {
    addAction: (action) => {
      actions.push(action)
      return {
        dispose: () => disposed.push(action.id)
      }
    },
    getPosition: () => ({ lineNumber: 1, column: 1 }),
    getModel: () => ({
      getValue: () => value,
      getOffsetAt: () => offset,
      getLanguageId: () => languageId
    })
  }

  return { actions, disposed, editor }
}

describe('registerJsonPathActions', () => {
  it('registers the JSON path action by default', () => {
    const { actions, editor } = createEditor('{"simple":1}', 2)

    registerJsonPathActions(editor)

    assert.deepEqual(
      actions.map((action) => action.id),
      ['fluid.copy-json-path']
    )
    assert.deepEqual(
      actions.map((action) => action.label),
      ['Copy JSON Path']
    )
  })

  it('uses custom action definitions and copy callbacks', async () => {
    const { actions, editor } = createEditor('{"simple":1}', 2)
    const copied = []
    const copyText = (text) => copied.push(text)
    const copiedEvents = []
    const onCopied = (...args) => copiedEvents.push(args)
    const jsonAction = createJsonPathAction({ label: 'Copiar JSON Path' })

    registerJsonPathActions(editor, {
      actions: [jsonAction],
      copyText,
      onCopied
    })

    assert.equal(actions[0].label, 'Copiar JSON Path')

    await actions[0].run()

    assert.deepEqual(copied, ['simple'])
    assert.deepEqual(copiedEvents, [['simple', jsonAction, ['simple']]])
  })

  it('registers Go template paths through the optional add-on action', async () => {
    const value = '{"customer":{"orders":[{"shipping-address":{"city":"Floripa"}}]}}'
    const { actions, editor } = createEditor(value, value.indexOf('Floripa'))
    const copied = []

    registerJsonPathActions(editor, {
      actions: [createJsonPathAction(), createGoTemplatePathAction()],
      copyText: (text) => copied.push(text)
    })

    await actions[1].run()

    assert.deepEqual(copied, [
      '{{ index . "customer" "orders" 0 "shipping-address" "city" }}'
    ])
  })

  it('does nothing for non-json languages by default', async () => {
    const { actions, editor } = createEditor('{"simple":1}', 2, 'text')
    const copied = []

    registerJsonPathActions(editor, { copyText: (text) => copied.push(text) })

    await actions[0].run()

    assert.deepEqual(copied, [])
  })

  it('notifies when no path can be resolved', async () => {
    const { actions, editor } = createEditor('', 0)
    const unavailableEvents = []

    registerJsonPathActions(editor, {
      onUnavailable: (action) => unavailableEvents.push(action.id)
    })

    await actions[0].run()

    assert.deepEqual(unavailableEvents, ['fluid.copy-json-path'])
  })

  it('returns a combined disposable', () => {
    const { disposed, editor } = createEditor('{"simple":1}', 2)

    const disposable = registerJsonPathActions(editor, {
      actions: [createJsonPathAction(), createGoTemplatePathAction()]
    })

    disposable.dispose()

    assert.deepEqual(disposed, ['fluid.copy-json-path', 'fluid.copy-go-template-path'])
  })
})
