import {
  findNodeAtOffset,
  getNodePath,
  parseTree,
  type Node,
  type ParseError
} from 'jsonc-parser'

export type JsonPathPart = string | number

export type TextModelLike<Position = unknown> = {
  getValue: () => string
  getOffsetAt: (position: Position) => number
}

export type GetJsonPathOptions = {
  parseErrors?: ParseError[]
}

const JSON_PATH_SAFE_IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/

const isJsonPathSafeIdentifier = (value: string) =>
  JSON_PATH_SAFE_IDENTIFIER_REGEX.test(value)

const isPropertyKeyNode = (node: Node) =>
  node.parent?.type === 'property' && node.parent.children?.[0] === node

const isPropertyNode = (node: Node) => node.type === 'property'

const getPathTargetNode = (node: Node) => {
  if (isPropertyNode(node)) return node.children?.[1] ?? node.children?.[0] ?? node

  if (!isPropertyKeyNode(node)) return node

  return node.parent?.children?.[1] ?? node
}

const isJsonPathPart = (part: unknown): part is JsonPathPart =>
  typeof part === 'string' || typeof part === 'number'

export const getJsonPathAtOffset = (
  value: string,
  offset: number,
  options: GetJsonPathOptions = {}
): JsonPathPart[] | null => {
  const root = parseTree(value, options.parseErrors)

  if (!root) return null

  const node = findNodeAtOffset(root, offset, true)

  if (!node) return null

  const path = getNodePath(getPathTargetNode(node))

  if (!path.length || !path.every(isJsonPathPart)) return null

  return path
}

export const getJsonPathAtPosition = <Position>(
  model: TextModelLike<Position>,
  position: Position,
  options?: GetJsonPathOptions
): JsonPathPart[] | null => {
  const offset = model.getOffsetAt(position)

  return getJsonPathAtOffset(model.getValue(), offset, options)
}

export const formatJsonPath = (path: JsonPathPart[]) =>
  path
    .map((part, index) => {
      if (typeof part === 'number') return `[${part}]`

      if (isJsonPathSafeIdentifier(part)) return index === 0 ? part : `.${part}`

      return `[${JSON.stringify(part)}]`
    })
    .join('')
