// estilos compartilhados de formulario e botoes (mesmos do login)

export const fieldClass = `w-full rounded-xl border border-line-strong bg-surface px-4 dark:bg-black/25
    text-ink placeholder:text-faint transition-[border-color,box-shadow]
    duration-200 hover:border-line-hover
    focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15 dark:focus:border-blue-400 dark:focus:ring-blue-400/20
    aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15`

export const inputClass = `${fieldClass} h-12`

export const labelClass = "mb-2 block text-sm font-medium"

export const primaryButtonClass = `inline-flex h-11 items-center justify-center gap-2 rounded-xl
    bg-blue-600 px-5 font-medium text-white transition-[background-color,scale] duration-160
    hover:bg-blue-700 active:scale-[0.97]
    aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60`

export const secondaryButtonClass = `inline-flex h-11 items-center justify-center gap-2 rounded-xl
    border border-line-strong bg-surface px-5 font-medium text-ink-2
    transition-[background-color,border-color,scale] duration-160
    hover:border-line-hover hover:bg-ink/5 active:scale-[0.97]`

export const alertClass = "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300"

// acao destrutiva: contorno vermelho no repouso, cheio so na confirmacao
export const dangerButtonClass = `inline-flex h-11 items-center justify-center gap-2 rounded-xl
    border border-red-200 bg-surface px-5 font-medium text-red-700 dark:border-red-400/30 dark:bg-transparent dark:text-red-300
    transition-[background-color,border-color,scale] duration-160
    hover:border-red-300 hover:bg-red-50 active:scale-[0.97] dark:hover:bg-red-500/10
    aria-disabled:cursor-not-allowed aria-disabled:opacity-60`

export const dangerSolidButtonClass = `inline-flex h-11 items-center justify-center gap-2 rounded-xl
    bg-red-600 px-5 font-medium text-white transition-[background-color,scale] duration-160
    hover:bg-red-700 active:scale-[0.97]
    aria-disabled:cursor-not-allowed aria-disabled:opacity-60`
