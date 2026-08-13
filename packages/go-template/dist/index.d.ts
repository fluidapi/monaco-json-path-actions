export type JsonPathPart = string | number;
export type JsonPathActionDefinition = {
    id: string;
    label: string;
    formatter: (path: JsonPathPart[]) => string;
    contextMenuGroupId?: string;
    contextMenuOrder?: number;
    precondition?: string;
};
export declare const formatGoTemplatePath: (path: JsonPathPart[]) => string;
export declare const createGoTemplatePathAction: (overrides?: Partial<JsonPathActionDefinition>) => JsonPathActionDefinition;
//# sourceMappingURL=index.d.ts.map