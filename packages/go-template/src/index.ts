export type JsonPathPart = string | number

export type JsonPathActionDefinition = {
  id: string
  label: string
  formatter: (path: JsonPathPart[]) => string
  contextMenuGroupId?: string
  contextMenuOrder?: number
  precondition?: string
}

const GO_TEMPLATE_SAFE_IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/

const isGoTemplateSafeIdentifier = (value: string) =>
  GO_TEMPLATE_SAFE_IDENTIFIER_REGEX.test(value)

export const formatGoTemplatePath = (path: JsonPathPart[]) => {
  const canUseDotNotation = path.every(
    (part) => typeof part === 'string' && isGoTemplateSafeIdentifier(part)
  )

  if (canUseDotNotation) return `{{ .${path.join('.')} }}`

  const indexArgs = path
    .map((part) => (typeof part === 'number' ? String(part) : JSON.stringify(part)))
    .join(' ')

  return `{{ index . ${indexArgs} }}`
}

export const createGoTemplatePathAction = (
  overrides: Partial<JsonPathActionDefinition> = {}
): JsonPathActionDefinition => ({
  id: 'fluid.copy-go-template-path',
  label: 'Copy Go Template Path',
  formatter: formatGoTemplatePath,
  ...overrides
})
