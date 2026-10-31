import type { TicketPriority, TicketStatus } from "../types/Ticket"
import { priorityLevel, priorityName, statusDot, statusLabel } from "../data/ticketLabels"

// os dois indicadores seguem a mesma linguagem: marca + texto, sem fundo.
// Quem usa coloca o rotulo ("Status", "Prioridade") em cima: cor e barras nunca ficam lado a lado sem legenda.

export function StatusBadge({ status } : { status: TicketStatus }){

    return (
        <span className="inline-flex items-center gap-2 font-medium">
            <span
                className={`size-2.5 rounded-full transition-colors duration-200 ${statusDot[status]}`}
                aria-hidden="true"
            />
            {statusLabel[status]}
        </span>
    )

}

// tres barras de sinal: quanto mais urgente, mais barras preenchidas (vermelho so na alta)
export function PriorityBars({ priority } : { priority: TicketPriority }){

    const level = priorityLevel[priority]
    const filled = priority === "Alta" ? "bg-red-500" : "bg-slate-600 dark:bg-slate-200"

    return (
        <span className="flex items-end gap-0.5" aria-hidden="true">
            {[1, 2, 3].map((bar) => (
                <span
                    key={bar}
                    className={`w-1 rounded-sm transition-colors duration-200 ${bar <= level ? filled : "bg-slate-300 dark:bg-white/20"}`}
                    style={{ height: 4 + bar * 3 }}
                />
            ))}
        </span>
    )

}

export function PriorityBadge({ priority } : { priority: TicketPriority }){

    return (
        <span className="inline-flex items-center gap-2 font-medium">
            <PriorityBars priority={priority} />
            {priorityName[priority]}
        </span>
    )

}
