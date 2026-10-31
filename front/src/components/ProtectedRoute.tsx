import { Navigate, Outlet, useLocation } from "react-router"

import { getToken } from "../services/authService"

export function ProtectedRoute(){

    const location = useLocation()

    if(!getToken()){
        // guarda de onde veio para voltar depois do login
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <Outlet />

}
