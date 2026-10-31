import type { ReactNode } from "react"

type SegmentedProps<T extends string | boolean> = {
    legend: string
    // sr-only no login (o titulo da tela ja explica); visivel nos formularios
    legendClassName?: string
    name: string
    value: T
    options: { value: T, label: string, count?: number, icon?: ReactNode }[]
    onChange: (value: T) => void
}

export function Segmented<T extends string | boolean>({
    legend, legendClassName = "sr-only", name, value, options, onChange
} : SegmentedProps<T>){

    const index = Math.max(0, options.findIndex((option) => option.value === value))

    return (
        <fieldset>
            <legend className={legendClassName}>{legend}</legend>

            <div
                className="relative grid rounded-xl bg-ink/[0.07] p-1
                    has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2
                    has-[input:focus-visible]:outline-blue-600"
                style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
            >

                {/* indicador que desliza ate a opcao escolhida */}
                <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-1 rounded-lg bg-surface shadow-sm ring-1 ring-ink/5
                        transition-transform duration-300 ease-out dark:bg-white/15 dark:ring-white/10"
                    style={{
                        width: `calc((100% - 8px) / ${options.length})`,
                        transform: `translateX(${index * 100}%)`,
                    }}
                />

                {options.map((option) => (
                    <label
                        key={option.label}
                        className={`relative cursor-pointer whitespace-nowrap rounded-lg py-2 text-center text-[13px] font-medium sm:px-3 sm:text-sm
                            transition-colors duration-200
                            ${value === option.value ? "text-ink" : "text-muted hover:text-ink"}`}
                    >
                        <input
                            type="radio"
                            name={name}
                            className="sr-only"
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                        />
                        <span className="inline-flex items-center justify-center gap-1.5">
                            {option.icon}
                            {option.label}
                        </span>
                        {/* contagem discreta; some no celular, onde as opcoes ficam estreitas */}
                        {option.count !== undefined && (
                            <span className="ml-1.5 hidden text-subtle sm:inline">{option.count}</span>
                        )}
                    </label>
                ))}

            </div>
        </fieldset>
    )

}
