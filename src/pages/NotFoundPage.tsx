import { Link } from "react-router";
import { primaryButtonClass } from "../components/formStyles";

export function NotFoundPage(){

    return(
        <div className="py-20 text-center">

            <p className="text-7xl font-semibold tracking-tight text-line-strong">
                404
            </p>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                Página não encontrada
            </h1>

            <p className="mt-2 text-muted">
                O endereço informado não existe.
            </p>

            <Link to="/" className={`${primaryButtonClass} mt-8`}>
                Voltar para o início
            </Link>

        </div>
    )

}
