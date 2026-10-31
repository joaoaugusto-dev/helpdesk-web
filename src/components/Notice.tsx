import { useEffect, useState } from "react"

const VISIBLE_MS = 4000
const EXIT_MS = 300

// confirmacao de uma acao ja concluida (criar/excluir). Aparece de baixo, some pelo mesmo caminho.
export function Notice({ message } : { message: string }){

    const [phase, setPhase] = useState<"enter" | "open" | "gone">("enter")

    useEffect(() => {
        // um frame no estado "enter" para a transicao ter de onde partir
        const frame = requestAnimationFrame(() => setPhase("open"))
        const close = setTimeout(() => setPhase("enter"), VISIBLE_MS)
        const remove = setTimeout(() => setPhase("gone"), VISIBLE_MS + EXIT_MS)

        return () => {
            cancelAnimationFrame(frame)
            clearTimeout(close)
            clearTimeout(remove)
        }
    }, [])

    if(phase === "gone"){
        return null
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center px-6">
            <p
                role="status"
                className={`flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium ring-1 ring-white/10
                    text-white shadow-lg transition-[opacity,translate] duration-300 ease-out
                    ${phase === "open" ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
                <svg viewBox="0 0 24 24" className="size-5 text-emerald-400" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                {message}
            </p>
        </div>
    )

}
