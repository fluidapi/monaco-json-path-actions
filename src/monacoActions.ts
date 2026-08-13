import {
  formatGoTemplatePath,
  formatJsonPath,
  getJsonPathAtPosition,
  type JsonPathPart
} from './jsonPath.js'

export type JsonPathActionFormat = 'jsonPath' | 'goTemplatePath'

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

export type RegisterJsonPathActionsOptions = {
  labels?: Partial<Record<JsonPathActionFormat, string>>
  enabledFormats?: JsonPathActionFormat[]
  contextMenuGroupId?: string
  contextMenuOrder?: Partial<Record<JsonPathActionFormat, number>>
  precondition?: string
  isEnabledForLanguage?: (languageId: string) => boolean
  copyText?: (text: string) => void | Promise<void>
  onCopied?: (text: string, format: JsonPathActionFormat, path: JsonPathPart[]) => void
  onUnavailable?: (format: JsonPathActionFormat) => void
  onCopyError?: (
    error: unknown,
    text: string,
    format: JsonPathActionFormat,
    path: JsonPathPart[]
  ) => void
}

type FormatConfig = {
  id: string
  defaultLabel: string
  formatter: (path: JsonPathPart[]) => string
}

const DEFAULT_JSON_LANGUAGE_IDS = new Set(['json', 'jsonc'])

const DEFAULT_PRECONDITION = "editorLangId == 'json' || editorLangId == 'jsonc'"

const DEFAULT_CONTEXT_MENU_GROUP_ID = '9_cutcopypaste'

const FORMAT_CONFIG: Record<JsonPathActionFormat, FormatConfig> = {
  jsonPath: {
    id: 'copy-json-path',
    defaultLabel: 'Copy JSON Path',
    formatter: formatJsonPath
  },
  goTemplatePath: {
    id: 'copy-go-template-path',
    defaultLabel: 'Copy Go Template Path',
    formatter: formatGoTemplatePath
  }
}

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
  const enabledFormats = options.enabledFormats ?? ['jsonPath', 'goTemplatePath']
  const copyText = options.copyText ?? defaultCopyText
  const isEnabledForLanguage =
    options.isEnabledForLanguage ??
    ((languageId: string) => DEFAULT_JSON_LANGUAGE_IDS.has(languageId))

  const disposables = enabledFormats.map((format, index) => {
    const config = FORMAT_CONFIG[format]

    return editor.addAction({
      id: `fluid.${config.id}`,
      label: options.labels?.[format] ?? config.defaultLabel,
      contextMenuGroupId: options.contextMenuGroupId ?? DEFAULT_CONTEXT_MENU_GROUP_ID,
      contextMenuOrder: options.contextMenuOrder?.[format] ?? index + 3,
      precondition: options.precondition ?? DEFAULT_PRECONDITION,
      run: async () => {
        const model = editor.getModel()
        const position = editor.getPosition()

        if (!model || !position) {
          options.onUnavailable?.(format)
          return
        }

        const languageId = model.getLanguageId?.()

        if (languageId && !isEnabledForLanguage(languageId)) return

        const path = getJsonPathAtPosition(model, position)

        if (!path) {
          options.onUnavailable?.(format)
          return
        }

        const text = config.formatter(path)

        try {
          await copyText(text)
          options.onCopied?.(text, format, path)
        } catch (error) {
          options.onCopyError?.(error, text, format, path)
        }
      }
    })
  })

  return createCombinedDisposable(disposables)
}
