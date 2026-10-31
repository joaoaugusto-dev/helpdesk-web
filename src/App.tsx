import {Route, Routes} from "react-router"
import { AppLayout } from "./layouts/AppLayout"

import { TicketPage } from "./pages/TicketPage"
import { HomePage } from "./pages/HomePage"
import { NewTicketPage } from "./pages/NewTicketPage"
import { TicketDetailsPage } from "./pages/TicketDetailsPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { LoginPage } from "./pages/LoginPage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AdminRoute } from "./components/AdminRoute"

function App() {

  return(   
    <>
    <Routes>

      <Route path="login" element={<LoginPage />} />

      <Route element = {<ProtectedRoute />} >

      <Route element = {<AppLayout />} >

        <Route
          index
          element={<HomePage />}
        />

        <Route 
          path="chamados"
          element={<TicketPage />}
        />

        <Route element={<AdminRoute />}>

          <Route 
            path="chamado/novo"
            element={<NewTicketPage />}
          />

        </Route>

        <Route
          path="chamado/:id"
          element={<TicketDetailsPage />}
        />

        <Route 
          path="*"
          element={<NotFoundPage />}
        />
        
      </Route>

      </Route>

    </Routes>
    </>
  )
  
}

export default App
