import { useEffect, useRef, type ReactNode } from "react"

import { dangerSolidButtonClass, secondaryButtonClass } from "./formStyles"

type ConfirmDialogProps = {
    open: boolean
    title: string
    children: ReactNode
    confirmLabel: string
    busyLabel: string
    busy: boolean
    onConfirm: () => void
    onCancel: () => void
}

const EXIT_MS = 150

// popup de confirmacao sobre o <dialog> nativo: o navegador cuida de foco preso, Esc e do fundo inerte
export function ConfirmDialog({
    open, title, children, confirmLabel, busyLabel, busy, onConfirm, onCancel
} : ConfirmDialogProps){

    const ref = useRef<HTMLDialogElement>(null)

    // abre com showModal(); ao fechar, marca data-closing para a animacao de saida rodar antes do close()
    useEffect(() => {
        const dialog = ref.current

        if(!dialog){
            return
        }

        if(open){
            if(!dialog.open){
                dialog.showModal()
            }
            return
        }

        if(!dialog.open){
            return
        }

        dialog.setAttribute("data-closing", "")

        const timer = setTimeout(() => {
            dialog.removeAttribute("data-closing")
            dialog.close()
        }, EXIT_MS)

        return () => clearTimeout(timer)
    }, [open])

    return (
        <dialog
            ref={ref}
            role="alertdialog"
            aria-labelledby="confirm-title"
            // Esc: o navegador fecharia sozinho; aqui o fechamento passa pelo estado (e pela animacao)
            onCancel={(event) => { event.preventDefault(); if(!busy) onCancel() }}
            // clique fora do cartao (no backdrop) cancela
            onClick={(event) => { if(event.target === event.currentTarget && !busy) onCancel() }}
            className="confirm-dialog m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl border border-line bg-surface
                p-0 text-ink shadow-2xl"
        >
            <div className="p-6">

                <div className="flex items-start gap-4">

                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
                        </svg>
                    </span>

                    <div className="min-w-0">
                        <h2 id="confirm-title" className="text-lg font-semibold tracking-tight">
                            {title}
                        </h2>

                        <div className="mt-1.5 break-words text-muted">
                            {children}
                        </div>
                    </div>

                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">

                    {/* foco inicial no Cancelar: a acao destrutiva nunca e a que o Enter dispara sem querer */}
                    <button autoFocus onClick={onCancel} aria-disabled={busy} className={secondaryButtonClass}>
                        Cancelar
                    </button>

                    <button onClick={onConfirm} aria-disabled={busy} className={dangerSolidButtonClass}>
                        {busy ? busyLabel : confirmLabel}
                    </button>

                </div>

            </div>
        </dialog>
    )

}
