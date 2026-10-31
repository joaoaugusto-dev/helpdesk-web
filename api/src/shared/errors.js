export function httpError(status, message, extra = {}) {
    return Object.assign(new Error(message), { status, extra })
}
