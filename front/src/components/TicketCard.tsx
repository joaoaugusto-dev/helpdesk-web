import { Link } from "react-router"
import type { TicketStatus, TicketPriority } from "../types/Ticket"
import { PriorityBadge, StatusBadge } from "./TicketBadges"

type TicketCardProps = {
    id : number
    title :  string
    description : string
    status: TicketStatus
    priority: TicketPriority
    // previa do formulario de novo chamado: ainda nao tem numero nem pagina de detalhe
    preview?: boolean
    // so o admin ve de quem e o chamado
    ownerName?: string
}

export function TicketCard({
    id,
    title,
    description,
    status,
    priority,
    preview = false,
    ownerName
} : TicketCardProps){

    return (
        <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5
            transition-[border-color,box-shadow] duration-200
            hover:border-line-strong hover:shadow-sm">

            <div className="flex items-start justify-between gap-4">
                <h3 className="min-w-0 break-words text-lg font-semibold tracking-tight text-ink">
                    {title}
                </h3>

                <span className="shrink-0 text-sm text-subtle">{preview ? "novo" : `#${id}`}</span>
            </div>

            <p className="mt-2 line-clamp-2 break-words text-muted">
                {description}
            </p>

            {ownerName && (
                <p className="mt-3 text-sm text-subtle">Aberto por <span className="font-medium text-muted">{ownerName}</span></p>
            )}

            <dl className="mt-5 flex items-start justify-between gap-4 border-t border-line-soft pt-4">
                <div>
                    <dt className="text-sm text-muted">Status</dt>
                    <dd className="mt-1.5"><StatusBadge status={status} /></dd>
                </div>

                <div className="text-right">
                    <dt className="text-sm text-muted">Prioridade</dt>
                    <dd className="mt-1.5 flex justify-end"><PriorityBadge priority={priority} /></dd>
                </div>
            </dl>

            {!preview && (
                <Link to={`/chamado/${id}`}
                    className="mt-5 self-start rounded text-sm font-medium text-blue-600 dark:text-blue-400
                        underline-offset-4 transition-colors hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                    Ver detalhes
                </Link>
            )}
        </article>
    )

}
