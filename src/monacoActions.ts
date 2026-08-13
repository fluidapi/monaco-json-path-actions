import {
  formatJsonPath,
  getJsonPathAtPosition,
  type JsonPathPart
} from './jsonPath.js'

export type Disposable = {
  dispose: () => void
}

export type MonacoModelLike<Position = unknown> = {
  getValue: () => string
  getOffsetAt: (position: Position) => number
  getLanguageId?: () => string
}

export type MonacoEditorAction = {
  id: string
  label: string
  contextMenuGroupId?: string
  contextMenuOrder?: number
  precondition?: string
  run: () => void | Promise<void>
}

export type MonacoEditorLike<Position = unknown> = {
  addAction: (action: MonacoEditorAction) => Disposable
  getModel: () => MonacoModelLike<Position> | null
  getPosition: () => Position | null
}

export type JsonPathFormatter = (path: JsonPathPart[]) => string

export type JsonPathActionDefinition = {
  id: string
  label: string
  formatter: JsonPathFormatter
  contextMenuGroupId?: string
  contextMenuOrder?: number
  precondition?: string
}

export type RegisterJsonPathActionsOptions = {
  actions?: JsonPathActionDefinition[]
  contextMenuGroupId?: string
  contextMenuOrder?: number
  precondition?: string
  isEnabledForLanguage?: (languageId: string) => boolean
  copyText?: (text: string) => void | Promise<void>
  onCopied?: (text: string, action: JsonPathActionDefinition, path: JsonPathPart[]) => void
  onUnavailable?: (action: JsonPathActionDefinition) => void
  onCopyError?: (
    error: unknown,
    text: string,
    action: JsonPathActionDefinition,
    path: JsonPathPart[]
  ) => void
}

const DEFAULT_JSON_LANGUAGE_IDS = new Set(['json', 'jsonc'])

const DEFAULT_PRECONDITION = "editorLangId == 'json' || editorLangId == 'jsonc'"

const DEFAULT_CONTEXT_MENU_GROUP_ID = '9_cutcopypaste'

export const createJsonPathAction = (
  overrides: Partial<JsonPathActionDefinition> = {}
): JsonPathActionDefinition => ({
  id: 'fluid.copy-json-path',
  label: 'Copy JSON Path',
  formatter: formatJsonPath,
  ...overrides
})

const defaultCopyText = async (text: string) => {
  if (!globalThis.navigator?.clipboard?.writeText) {
    throw new Error('Clipboard API is not available')
  }

  await globalThis.navigator.clipboard.writeText(text)
}

const createCombinedDisposable = (disposables: Disposable[]): Disposable => ({
  dispose: () => {
    disposables.forEach((disposable) => disposable.dispose())
  }
})

export const registerJsonPathActions = <Position>(
  editor: MonacoEditorLike<Position>,
  options: RegisterJsonPathActionsOptions = {}
): Disposable => {
  const actions = options.actions ?? [createJsonPathAction()]
  const copyText = options.copyText ?? defaultCopyText
  const isEnabledForLanguage =
    options.isEnabledForLanguage ??
    ((languageId: string) => DEFAULT_JSON_LANGUAGE_IDS.has(languageId))

  const disposables = actions.map((action, index) =>
    editor.addAction({
      id: action.id,
      label: action.label,
      contextMenuGroupId:
        action.contextMenuGroupId ??
        options.contextMenuGroupId ??
        DEFAULT_CONTEXT_MENU_GROUP_ID,
      contextMenuOrder: action.contextMenuOrder ?? options.contextMenuOrder ?? index + 3,
      precondition: action.precondition ?? options.precondition ?? DEFAULT_PRECONDITION,
      run: async () => {
        const model = editor.getModel()
        const position = editor.getPosition()

        if (!model || !position) {
          options.onUnavailable?.(action)
          return
        }

        const languageId = model.getLanguageId?.()

        if (languageId && !isEnabledForLanguage(languageId)) return

        const path = getJsonPathAtPosition(model, position)

        if (!path) {
          options.onUnavailable?.(action)
          return
        }

        const text = action.formatter(path)

        try {
          await copyText(text)
          options.onCopied?.(text, action, path)
        } catch (error) {
          options.onCopyError?.(error, text, action, path)
        }
      }
    })
  )

  return createCombinedDisposable(disposables)
}
