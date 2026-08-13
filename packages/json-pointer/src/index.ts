export type JsonPathPart = string | number

export type JsonPathActionDefinition = {
  id: string
  label: string
  formatter: (path: JsonPathPart[]) => string
  contextMenuGroupId?: string
  contextMenuOrder?: number
  precondition?: string
}

const escapeJsonPointerPart = (part: JsonPathPart) =>
  String(part).replace(/~/g, '~0').replace(/\//g, '~1')

export const formatJsonPointerPath = (path: JsonPathPart[]) =>
  `/${path.map(escapeJsonPointerPart).join('/')}`

export const createJsonPointerPathAction = (
  overrides: Partial<JsonPathActionDefinition> = {}
): JsonPathActionDefinition => ({
  id: 'fluid.copy-json-pointer-path',
  label: 'Copy JSON Pointer',
  formatter: formatJsonPointerPath,
  ...overrides
})
