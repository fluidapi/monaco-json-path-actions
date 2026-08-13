import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createGoTemplatePathAction,
  formatGoTemplatePath
} from '../packages/go-template/dist/index.js'

describe('goTemplatePath add-on', () => {
  describe('formatGoTemplatePath', () => {
    const cases = [
      [['simple'], '{{ .simple }}'],
      [['nested', 'value'], '{{ .nested.value }}'],
      [['array', 0, 'id'], '{{ index . "array" 0 "id" }}'],
      [['shipping-address'], '{{ index . "shipping-address" }}'],
      [['with space'], '{{ index . "with space" }}'],
      [['123key'], '{{ index . "123key" }}'],
      [['$schema'], '{{ index . "$schema" }}'],
      [['quote"inside'], '{{ index . "quote\\"inside" }}'],
      [
        ['customer', 'orders', 0, 'shipping-address', 'city'],
        '{{ index . "customer" "orders" 0 "shipping-address" "city" }}'
      ]
    ]

    for (const [path, expected] of cases) {
      it(`formats ${JSON.stringify(path)} as ${expected}`, () => {
        assert.equal(formatGoTemplatePath(path), expected)
      })
    }
  })

  it('creates a Monaco action definition', () => {
    const action = createGoTemplatePathAction({ label: 'Copiar Go Template Path' })

    assert.equal(action.id, 'fluid.copy-go-template-path')
    assert.equal(action.label, 'Copiar Go Template Path')
    assert.equal(action.formatter(['customer', 'name']), '{{ .customer.name }}')
  })
})
