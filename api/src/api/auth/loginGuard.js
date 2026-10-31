// Bloqueio temporario de login apos varias tentativas erradas seguidas.
// Vale para qualquer perfil (usuario ou admin) e e controlado por e-mail,
// inclusive e-mails que nao existem, para nao revelar quais contas existem.
// O estado fica em memoria e e zerado quando o servidor reinicia.

export function createLoginGuard({ maxAttempts, lockSeconds, now = () => Date.now() }) {
    const entries = new Map()

    function key(email) {
        return String(email).trim().toLowerCase()
    }

    function cleanup() {
        const current = now()

        for (const [k, entry] of entries) {
            if (entry.lockedUntil && entry.lockedUntil <= current) {
                entries.delete(k)
            }
        }
    }

    return {
        // Retorna os segundos restantes do bloqueio, ou 0 se pode tentar
        remainingLockSeconds(email) {
            const entry = entries.get(key(email))

            if (!entry?.lockedUntil) {
                return 0
            }

            const remainingMs = entry.lockedUntil - now()

            if (remainingMs <= 0) {
                entries.delete(key(email))
                return 0
            }

            return Math.ceil(remainingMs / 1000)
        },

        registerFailure(email) {
            cleanup()

            const k = key(email)
            const entry = entries.get(k) ?? { failures: 0, lockedUntil: 0 }

            entry.failures += 1

            if (entry.failures >= maxAttempts) {
                entry.lockedUntil = now() + lockSeconds * 1000
                entry.failures = 0
            }

            entries.set(k, entry)
        },

        registerSuccess(email) {
            entries.delete(key(email))
        }
    }
}
