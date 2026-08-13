import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { registerJsonPathActions } from '../dist/index.js'

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
  it('registers JSON path and Go template path actions', () => {
    const { actions, editor } = createEditor('{"simple":1}', 2)

    registerJsonPathActions(editor)

    assert.deepEqual(
      actions.map((action) => action.id),
      ['fluid.copy-json-path', 'fluid.copy-go-template-path']
    )
    assert.deepEqual(
      actions.map((action) => action.label),
      ['Copy JSON Path', 'Copy Go Template Path']
    )
  })

  it('uses custom labels and copy callbacks', async () => {
    const { actions, editor } = createEditor('{"simple":1}', 2)
    const copied = []
    const copyText = (text) => copied.push(text)
    const copiedEvents = []
    const onCopied = (...args) => copiedEvents.push(args)

    registerJsonPathActions(editor, {
      labels: {
        jsonPath: 'Copiar JSON Path',
        goTemplatePath: 'Copiar Go Template Path'
      },
      copyText,
      onCopied
    })

    assert.equal(actions[0].label, 'Copiar JSON Path')

    await actions[0].run()

    assert.deepEqual(copied, ['simple'])
    assert.deepEqual(copiedEvents, [['simple', 'jsonPath', ['simple']]])
  })

  it('formats Go template paths through index when needed', async () => {
    const value = '{"customer":{"orders":[{"shipping-address":{"city":"Floripa"}}]}}'
    const { actions, editor } = createEditor(value, value.indexOf('Floripa'))
    const copied = []

    registerJsonPathActions(editor, { copyText: (text) => copied.push(text) })

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
      onUnavailable: (format) => unavailableEvents.push(format)
    })

    await actions[0].run()

    assert.deepEqual(unavailableEvents, ['jsonPath'])
  })

  it('returns a combined disposable', () => {
    const { disposed, editor } = createEditor('{"simple":1}', 2)

    const disposable = registerJsonPathActions(editor)

    disposable.dispose()

    assert.deepEqual(disposed, ['fluid.copy-json-path', 'fluid.copy-go-template-path'])
  })
})
