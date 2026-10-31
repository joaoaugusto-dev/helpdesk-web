import type { CSSProperties, ReactNode } from "react"

type PanelProps = {
    title: string
    children: ReactNode
    className?: string
    style?: CSSProperties
}

// cartao de secao: titulo + conteudo
export function Panel({title, children, className = "", style} : PanelProps){

    return (

        <section className={`rounded-2xl border border-line bg-surface p-6 ${className}`} style={style}>

            <h2 className="mb-5 text-lg font-semibold tracking-tight">
                {title}
            </h2>

            {children}

        </section>

    )

}
