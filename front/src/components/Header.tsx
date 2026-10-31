import type { ReactNode } from "react"

type HeaderProps = {
  title: string
  subtitle: string
  // botao ou link principal da pagina, alinhado a direita
  action?: ReactNode
}

// cabecalho padrao das paginas internas
export function Header({title, subtitle, action} : HeaderProps){

    return (

        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>

            <p className="mt-2 max-w-prose text-ink-2">
              {subtitle}
            </p>
          </div>

          {action}

        </header>

    )

}
