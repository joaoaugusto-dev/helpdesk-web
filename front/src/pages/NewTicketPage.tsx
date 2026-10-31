import { useState, type SyntheticEvent } from "react"
import type { TicketPriority } from "../types/Ticket"
import { Link, useNavigate } from "react-router"
import { ticketService } from "../services/ticketService"
import { Header } from "../components/Header"
import { Segmented } from "../components/Segmented"
import { PriorityBars } from "../components/TicketBadges"
import { TicketCard } from "../components/TicketCard"
import { alertClass, fieldClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "../components/formStyles"

export function NewTicketPage(){

    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<TicketPriority>("Baixa")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>){

        event.preventDefault()

        if(saving){
            return
        }

        if(!title.trim()){
            setError("Informe o título do chamado.")
            return
        }

        if(!description.trim()){
            setError("Informe a descrição do chamado.")
            return
        }

        try{
            setSaving(true)
            setError(null)

            await ticketService.create({
                title: title.trim(),
                description: description.trim(),
                status: "Aberto",
                priority
            })

            // a lista mostra a confirmacao (Notice) a partir do state da navegacao
            navigate("/chamados", { state: { notice: "Chamado criado." } })
        } catch (error) {
            setError(
                error instanceof TypeError
                    ? "Não foi possível conectar à API. Confira se ela está rodando."
                    : error instanceof Error
                        ? error.message
                        : "Erro ao criar o chamado."
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>

            <Header
                title="Novo chamado"
                subtitle="Descreva o problema para a equipe de suporte."
            />

            <div className="grid animate-enter items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-6 rounded-2xl border border-line bg-surface p-6 sm:p-8"
                >

                    <div>
                        <label htmlFor="title" className={labelClass}>
                            Título
                        </label>
                        <input id="title" type="text" value={title}
                            placeholder="Ex.: Erro ao gerar relatório"
                            onChange={(event)=>setTitle(event.target.value)}
                            aria-invalid={error !== null && !title.trim()}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className={labelClass}>
                            Descrição
                        </label>
                        <textarea id="description" rows={5}
                            value={description}
                            placeholder="O que aconteceu e o que você esperava?"
                            onChange={(event)=>setDescription(event.target.value)}
                            aria-invalid={error !== null && !description.trim()}
                            className={`${fieldClass} resize-y py-3`}
                        />
                    </div>

                    <Segmented
                        legend="Prioridade"
                        legendClassName={labelClass}
                        name="priority"
                        value={priority}
                        onChange={setPriority}
                        options={[
                            { value: "Baixa", label: "Baixa", icon: <PriorityBars priority="Baixa" /> },
                            { value: "Media", label: "Média", icon: <PriorityBars priority="Media" /> },
                            { value: "Alta", label: "Alta", icon: <PriorityBars priority="Alta" /> },
                        ]}
                    />

                    {error && (
                        <div role="alert" className={`${alertClass} animate-enter`}>
                            {error}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button type="submit" aria-disabled={saving} className={primaryButtonClass}>
                            {saving
                                ? "Salvando..."
                                : "Criar chamado"
                            }
                        </button>

                        <Link to="/chamados" className={secondaryButtonClass}>
                            Cancelar
                        </Link>
                    </div>

                </form>

                {/* previa: o mesmo card da lista, atualizado enquanto voce digita. So no desktop. */}
                <aside aria-label="Prévia do chamado" className="hidden lg:sticky lg:top-24 lg:block">

                    <p className="mb-3 text-sm text-muted">
                        Assim o chamado vai aparecer na fila
                    </p>

                    <div className={`transition-opacity duration-200 ${title.trim() || description.trim() ? "opacity-100" : "opacity-60"}`}>
                        <TicketCard
                            preview
                            id={0}
                            title={title.trim() || "Título do chamado"}
                            description={description.trim() || "A descrição aparece aqui."}
                            status="Aberto"
                            priority={priority}
                        />
                    </div>

                </aside>

            </div>

        </div>
    )

}
