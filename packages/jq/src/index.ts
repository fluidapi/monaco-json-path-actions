export type JsonPathPart = string | number

export type JsonPathActionDefinition = {
  id: string
  label: string
  formatter: (path: JsonPathPart[]) => string
  contextMenuGroupId?: string
  contextMenuOrder?: number
  precondition?: string
}

const JQ_SAFE_IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/

const isJqSafeIdentifier = (value: string) => JQ_SAFE_IDENTIFIER_REGEX.test(value)

export const formatJqPath = (path: JsonPathPart[]) =>
  path.reduce<string>((result, part) => {
    if (typeof part === 'number') return `${result}[${part}]`

    if (isJqSafeIdentifier(part)) return result === '.' ? `${result}${part}` : `${result}.${part}`

    return `${result}[${JSON.stringify(part)}]`
  }, '.')

export const createJqPathAction = (
  overrides: Partial<JsonPathActionDefinition> = {}
): JsonPathActionDefinition => ({
  id: 'fluid.copy-jq-path',
  label: 'Copy jq Path',
  formatter: formatJqPath,
  ...overrides
})
