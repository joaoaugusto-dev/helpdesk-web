import { useEffect, useState, type ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { Header } from "../components/Header"
import { Notice } from "../components/Notice"
import { Segmented } from "../components/Segmented"
import { PriorityBars } from "../components/TicketBadges"
import { TicketCard } from "../components/TicketCard"
import { alertClass, primaryButtonClass } from "../components/formStyles"
import type { Ticket, TicketFilter, TicketPriorityFilter, TicketStatus } from "../types/Ticket"
import { compareTickets } from "../data/ticketOrder"
import { statusDot } from "../data/ticketLabels"
import { authService } from "../services/authService"
import { ticketService } from "../services/ticketService"

// "tudo": tres linhas, o oposto de um filtro especifico
const AllIcon = (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" aria-hidden="true">
    <path d="M5 7h14M5 12h14M5 17h14" />
  </svg>
)

// os icones repetem os do card: ponto colorido = status, barras de sinal = prioridade
const dot = (status: TicketStatus) => (
  <span className={`hidden size-2 rounded-full sm:block ${statusDot[status]}`} aria-hidden="true" />
)

const filters: { value: TicketFilter, label: string, icon: ReactNode }[] = [
  { value: "Todos", label: "Todos", icon: AllIcon },
  { value: "Aberto", label: "Abertos", icon: dot("Aberto") },
  { value: "Em andamento", label: "Andamento", icon: dot("Em andamento") },
  { value: "Concluido", label: "Concluídos", icon: dot("Concluido") },
]

const priorityFilters: { value: TicketPriorityFilter, label: string, icon: ReactNode }[] = [
  { value: "Todas", label: "Todas", icon: AllIcon },
  { value: "Alta", label: "Alta", icon: <PriorityBars priority="Alta" /> },
  { value: "Media", label: "Média", icon: <PriorityBars priority="Media" /> },
  { value: "Baixa", label: "Baixa", icon: <PriorityBars priority="Baixa" /> },
]

function TicketSkeleton(){

  return (
    <div className="animate-pulse rounded-2xl border border-line bg-surface p-5" aria-hidden="true">
      <div className="h-5 w-2/3 rounded bg-line" />
      <div className="mt-3 h-4 w-full rounded bg-line-soft" />
      <div className="mt-2 h-4 w-4/5 rounded bg-line-soft" />
      <div className="mt-5 flex gap-3">
        <div className="h-7 w-28 rounded-full bg-line-soft" />
        <div className="h-7 w-32 rounded-full bg-line-soft" />
      </div>
    </div>
  )

}

export function TicketPage(){

  const location = useLocation()
  const navigate = useNavigate()

  // aviso enviado pela pagina anterior (chamado criado/excluido); guardado uma vez e removido do historico
  const [notice] = useState<string | null>(() => location.state?.notice ?? null)

  const [tickets, setTickets] = useState<Ticket[]>([])

  const [filter, setFilter] = useState<TicketFilter>("Todos")

  const [priorityFilter, setPriorityFilter] = useState<TicketPriorityFilter>("Todas")

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  // so a primeira entrada faz o stagger completo; trocar de filtro e frequente e fica so no fade
  const [filtered, setFiltered] = useState(false)

  // a prioridade escolhida vale para tudo: lista e contagens dos chips de status batem com o que aparece
  const byPriority = tickets.filter(
    (ticket) => priorityFilter === "Todas" || ticket.priority === priorityFilter
  )

  const filteredTickets = [...byPriority].sort(compareTickets).filter(
    (ticket) => {
      if(filter === "Todos"){
        return true
      }

      return ticket.status === filter
    }
  )

  function countOf(value: TicketFilter){
    return value === "Todos"
      ? byPriority.length
      : byPriority.filter((ticket) => ticket.status === value).length
  }

  useEffect(() => {
    if(notice){
      // limpa o state para o aviso nao reaparecer ao recarregar a pagina
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [notice, navigate, location.pathname])

  useEffect(() => {
    async function loadTickets(){

      try{

        setLoading(true)
        setError(null)

        const data = await ticketService.getAll()

        setTickets(data)

      } catch (error) {

        setError(error instanceof Error ? error.message : "Não foi possível carregar os chamados")

      } finally {
        setLoading(false)
      }

    }

    loadTickets()
  }, [])

  return (
    <>

      <Header
        title = "Chamados"
        subtitle = "Acompanhe a fila e abra um chamado para ver os detalhes."
        action = {
          authService.isAdmin() && (
            <Link to="/chamado/novo" className={primaryButtonClass}>
              Novo chamado
            </Link>
          )
        }
      />

      {error && (
        <div role="alert" className={alertClass}>
          {error}
        </div>
      )}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Carregando chamados">
          {[1, 2, 3, 4].map((item) => <TicketSkeleton key={item} />)}
        </div>
      )}

      {!loading && !error && (
        <>

          {/* os dois filtros usam o mesmo componente: mesma aparencia, mesmo rotulo, mesma altura */}
          <div className="mb-6 flex flex-wrap items-start gap-x-6 gap-y-5">

            <div className="w-full sm:w-[32rem]">
              <Segmented<TicketFilter>
                legend="Status"
                legendClassName="mb-2 block text-sm text-muted"
                name="status-filter"
                value={filter}
                onChange={(value) => { setFilter(value); setFiltered(true) }}
                options={filters.map((item) => ({ ...item, count: countOf(item.value) }))}
              />
            </div>

            <div className="w-full sm:w-80">
              <Segmented<TicketPriorityFilter>
                legend="Prioridade"
                legendClassName="mb-2 block text-sm text-muted"
                name="priority-filter"
                value={priorityFilter}
                onChange={(value) => { setPriorityFilter(value); setFiltered(true) }}
                options={priorityFilters}
              />
            </div>

          </div>

          {filteredTickets.length === 0 ? (

            <p className="rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center text-muted">
              Nenhum chamado com esses filtros.
            </p>

          ) : (

            // key = filtros: a grade remonta e os cards entram de novo
            // o ultimo card, quando sobra sozinho na linha (total impar), ocupa as duas colunas com a largura de um card e fica no centro
            <div
              key={`${filter}-${priorityFilter}`}
              className="grid gap-4 md:grid-cols-2
                md:[&>:last-child:nth-child(odd)]:col-span-2
                md:[&>:last-child:nth-child(odd)]:w-[calc(50%-0.5rem)]
                md:[&>:last-child:nth-child(odd)]:justify-self-center"
            >

              {filteredTickets.map((ticket, index)=>(

                <div
                  key = {ticket.id}
                  className={filtered ? "animate-fade" : "animate-enter"}
                  // stagger de 40ms, limitado aos 8 primeiros para a fila nunca demorar a aparecer
                  style={filtered ? undefined : { animationDelay: `${Math.min(index, 7) * 40}ms` }}
                >
                  <TicketCard
                    id = {ticket.id}
                    title = {ticket.title}
                    description = {ticket.description}
                    status = {ticket.status}
                    priority = {ticket.priority}
                  />
                </div>

              ))}

            </div>

          )}

        </>
      )}

      {notice && <Notice message={notice} />}

    </>
  )

}
