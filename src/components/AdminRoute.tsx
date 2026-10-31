import { Link, Outlet } from "react-router"

import { authService } from "../services/authService"
import { secondaryButtonClass } from "./formStyles"

// rotas so de administrador (a API tambem recusa com 403; aqui o usuario ve o motivo em vez de um erro)
export function AdminRoute(){

    if(!authService.isAdmin()){
        return (
            <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Acesso restrito a administradores
                </h1>

                <p className="mt-2 text-muted">
                    Seu perfil pode consultar os chamados, mas não criar nem alterar.
                </p>

                <Link to="/chamados" className={`${secondaryButtonClass} mt-6`}>
                    Voltar para chamados
                </Link>
            </div>
        )
    }

    return <Outlet />

}
