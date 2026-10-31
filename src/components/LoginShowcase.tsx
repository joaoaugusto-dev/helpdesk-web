import type { TicketPriority, TicketStatus } from "../types/Ticket"
import { priorityLabel, statusDot, statusLabel } from "../data/ticketLabels"
import { BrandMark } from "./BrandMark"

type ShowcaseTicket = {
    id: number
    title: string
    status: TicketStatus
    priority: TicketPriority
    offset: string
}

// mesmos chamados do database.json da API
const tickets: ShowcaseTicket[] = [
    { id: 4, title: "Erro ao gerar relatório", status: "Aberto", priority: "Alta", offset: "lg:ml-0" },
    { id: 2, title: "Atualização de cadastro", status: "Em andamento", priority: "Media", offset: "lg:ml-14" },
    { id: 3, title: "Troca de senha", status: "Concluido", priority: "Baixa", offset: "lg:ml-6" },
]

export function LoginShowcase(){

    return (
        <aside
            className="relative hidden flex-col justify-between overflow-hidden
                bg-slate-900 p-12 text-white lg:flex"
        >

            {/* grade de pontos discreta */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.07]
                    [background-image:radial-gradient(circle,white_1px,transparent_1px)]
                    [background-size:28px_28px]"
            />

            <div className="relative flex items-center gap-3">
                <BrandMark />
                <span className="text-lg font-semibold tracking-tight">HelpDesk Lite</span>
            </div>

            <div className="relative max-w-md">

                <h2 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight">
                    Cada chamado, do aberto ao concluído.
                </h2>

                <p className="mt-5 max-w-sm text-lg leading-relaxed text-slate-400">
                    Entre para acompanhar a fila, atualizar o andamento e fechar pendências.
                </p>

            </div>

            <ul className="relative flex flex-col gap-3" aria-hidden="true">

                {tickets.map((ticket, index) => (
                    <li
                        key={ticket.id}
                        className={`max-w-sm animate-rise ${ticket.offset}`}
                        style={{ animationDelay: `${300 + index * 120}ms` }}
                    >
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                            <div className="flex items-center justify-between gap-4">
                                <p className="font-medium">{ticket.title}</p>
                                <span className="text-sm text-slate-500">#{ticket.id}</span>
                            </div>

                            <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${statusDot[ticket.status]}`} />
                                    {statusLabel[ticket.status]}
                                </span>
                                <span>{priorityLabel[ticket.priority]}</span>
                            </div>
                        </div>
                    </li>
                ))}

            </ul>

        </aside>
    )

}
