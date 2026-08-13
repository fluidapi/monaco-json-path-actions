const GO_TEMPLATE_SAFE_IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
const isGoTemplateSafeIdentifier = (value) => GO_TEMPLATE_SAFE_IDENTIFIER_REGEX.test(value);
export const formatGoTemplatePath = (path) => {
    const canUseDotNotation = path.every((part) => typeof part === 'string' && isGoTemplateSafeIdentifier(part));
    if (canUseDotNotation)
        return `{{ .${path.join('.')} }}`;
    const indexArgs = path
        .map((part) => (typeof part === 'number' ? String(part) : JSON.stringify(part)))
        .join(' ');
    return `{{ index . ${indexArgs} }}`;
};
export const createGoTemplatePathAction = (overrides = {}) => ({
    id: 'fluid.copy-go-template-path',
    label: 'Copy Go Template Path',
    formatter: formatGoTemplatePath,
    ...overrides
});
//# sourceMappingURL=index.js.map