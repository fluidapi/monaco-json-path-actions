import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createJqPathAction, formatJqPath } from '../packages/jq/dist/index.js'

describe('jq add-on', () => {
  describe('formatJqPath', () => {
    const cases = [
      [['simple'], '.simple'],
      [['nested', 'value'], '.nested.value'],
      [['array', 0, 'id'], '.array[0].id'],
      [['shipping-address'], '.["shipping-address"]'],
      [['with space'], '.["with space"]'],
      [['123key'], '.["123key"]'],
      [['$schema'], '.["$schema"]'],
      [['quote"inside'], '.["quote\\"inside"]'],
      [
        ['customer', 'orders', 0, 'shipping-address', 'city'],
        '.customer.orders[0]["shipping-address"].city'
      ]
    ]

    for (const [path, expected] of cases) {
      it(`formats ${JSON.stringify(path)} as ${expected}`, () => {
        assert.equal(formatJqPath(path), expected)
      })
    }
  })

  it('creates a Monaco action definition', () => {
    const action = createJqPathAction({ label: 'Copiar jq Path' })

    assert.equal(action.id, 'fluid.copy-jq-path')
    assert.equal(action.label, 'Copiar jq Path')
    assert.equal(action.formatter(['customer', 'orders', 0, 'id']), '.customer.orders[0].id')
  })
})
