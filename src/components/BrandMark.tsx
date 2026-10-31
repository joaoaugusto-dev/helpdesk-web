export function BrandMark({ className = "size-9" } : { className?: string }){

    return (
        <span className={`grid place-items-center rounded-xl bg-blue-600 text-white ${className}`}>
            <svg viewBox="0 0 24 24" className="size-[58%]" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z" />
            </svg>
        </span>
    )

}
