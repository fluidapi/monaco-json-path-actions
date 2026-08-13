import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createJsonPointerPathAction,
  formatJsonPointerPath
} from '../packages/json-pointer/dist/index.js'

describe('jsonPointer add-on', () => {
  describe('formatJsonPointerPath', () => {
    const cases = [
      [['simple'], '/simple'],
      [['nested', 'value'], '/nested/value'],
      [['array', 0, 'id'], '/array/0/id'],
      [['shipping-address'], '/shipping-address'],
      [['with space'], '/with space'],
      [['123key'], '/123key'],
      [['$schema'], '/$schema'],
      [['quote"inside'], '/quote"inside'],
      [['slash/inside'], '/slash~1inside'],
      [['tilde~inside'], '/tilde~0inside'],
      [['both~/inside'], '/both~0~1inside'],
      [
        ['customer', 'orders', 0, 'shipping-address', 'city'],
        '/customer/orders/0/shipping-address/city'
      ]
    ]

    for (const [path, expected] of cases) {
      it(`formats ${JSON.stringify(path)} as ${expected}`, () => {
        assert.equal(formatJsonPointerPath(path), expected)
      })
    }
  })

  it('creates a Monaco action definition', () => {
    const action = createJsonPointerPathAction({ label: 'Copiar JSON Pointer' })

    assert.equal(action.id, 'fluid.copy-json-pointer-path')
    assert.equal(action.label, 'Copiar JSON Pointer')
    assert.equal(action.formatter(['customer', 'name']), '/customer/name')
  })
})
