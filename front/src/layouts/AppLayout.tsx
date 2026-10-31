import { Outlet, useLocation } from 'react-router'

import { Navbar } from '../components/Navbar'

export function AppLayout(){

    const { pathname } = useLocation()

    return (
        <div className='relative isolate min-h-screen bg-page'>

            <Navbar />

            <main className='mx-auto max-w-6xl px-6 py-10'>

                {/* key = rota: cada pagina entra com um fade curto (acao de dezenas de vezes por dia: discreto) */}
                <div key={pathname} className='animate-fade'>
                    <Outlet />
                </div>

            </main>

        </div>
    )

}
