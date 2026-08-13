import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  formatGoTemplatePath,
  formatJsonPath,
  getJsonPathAtOffset,
  getJsonPathAtPosition
} from '../dist/index.js'

const fixture = `{
  "simple": 1,
  "nested": {
    "value": 2
  },
  "array": [
    {
      "id": 3
    }
  ],
  "shipping-address": 4,
  "with space": 5,
  "123key": 6,
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "quote\\"inside": 7,
  "nestedArray": [[{"value": 8}]],
  "propertyThenArray": {
    "items": [9]
  }
}`

const offsetOf = (text, search) => {
  const offset = text.indexOf(search)

  if (offset < 0) throw new Error(`Could not find "${search}" in fixture`)

  return offset
}

describe('jsonPath', () => {
  describe('getJsonPathAtOffset', () => {
    const cases = [
      ['"simple"', ['simple']],
      ['1', ['simple']],
      ['"value"', ['nested', 'value']],
      ['2', ['nested', 'value']],
      ['"id"', ['array', 0, 'id']],
      ['3', ['array', 0, 'id']],
      ['"shipping-address"', ['shipping-address']],
      ['"with space"', ['with space']],
      ['"123key"', ['123key']],
      ['"$schema"', ['$schema']],
      ['"quote\\"inside"', ['quote"inside']],
      ['"value": 8', ['nestedArray', 0, 0, 'value']],
      ['9', ['propertyThenArray', 'items', 0]]
    ]

    for (const [search, expectedPath] of cases) {
      it(`resolves ${search}`, () => {
        assert.deepEqual(getJsonPathAtOffset(fixture, offsetOf(fixture, search)), expectedPath)
      })
    }

    const colonCases = [
      ['"simple": ', ['simple']],
      ['"value": ', ['nested', 'value']]
    ]

    for (const [search, expectedPath] of colonCases) {
      it(`resolves the property path after the colon in ${search}`, () => {
        const offset = offsetOf(fixture, search) + search.length - 1

        assert.deepEqual(getJsonPathAtOffset(fixture, offset), expectedPath)
      })
    }

    it('resolves the object path when the cursor is on an object node', () => {
      assert.deepEqual(getJsonPathAtOffset(fixture, offsetOf(fixture, '{\n    "value"')), [
        'nested'
      ])
    })

    it('resolves the array path when the cursor is on an array node', () => {
      assert.deepEqual(getJsonPathAtOffset(fixture, offsetOf(fixture, '[\n    {')), ['array'])
    })

    it('returns null for the root node', () => {
      assert.equal(getJsonPathAtOffset(fixture, offsetOf(fixture, '{')), null)
    })

    it('returns null for incomplete json with no resolvable tree', () => {
      assert.equal(getJsonPathAtOffset('{', 0), null)
    })

    it('returns null for empty documents', () => {
      assert.equal(getJsonPathAtOffset('', 0), null)
    })

    it('returns null where there is no relevant node', () => {
      assert.equal(getJsonPathAtOffset(fixture, fixture.length + 1), null)
    })
  })

  describe('getJsonPathAtPosition', () => {
    it('uses the model offset for the received position', () => {
      const position = { lineNumber: 3, column: 6 }
      const calls = []
      const model = {
        getValue: () => fixture,
        getOffsetAt: (receivedPosition) => {
          calls.push(receivedPosition)
          return offsetOf(fixture, '"value"')
        }
      }

      assert.deepEqual(getJsonPathAtPosition(model, position), ['nested', 'value'])
      assert.deepEqual(calls, [position])
    })
  })

  describe('formatJsonPath', () => {
    const cases = [
      [['simple'], 'simple'],
      [['nested', 'value'], 'nested.value'],
      [['array', 0, 'id'], 'array[0].id'],
      [['shipping-address'], '["shipping-address"]'],
      [['with space'], '["with space"]'],
      [['123key'], '["123key"]'],
      [['$schema'], '$schema'],
      [['quote"inside'], '["quote\\"inside"]'],
      [
        ['customer', 'orders', 0, 'shipping-address', 'city'],
        'customer.orders[0]["shipping-address"].city'
      ]
    ]

    for (const [path, expected] of cases) {
      it(`formats ${JSON.stringify(path)} as ${expected}`, () => {
        assert.equal(formatJsonPath(path), expected)
      })
    }
  })

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
})
