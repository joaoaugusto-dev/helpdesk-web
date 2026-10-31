import express from 'express'
import cors from 'cors'
import path from 'node:path'

import { apiRouter } from './api/index.js'
import { createDb } from './shared/db.js'
import { errorHandler, notFound } from './shared/middleware.js'

export function createApp(config) {
    const db = createDb(config.databaseFile, config.bcryptRounds)

    const app = express()

    app.use(cors({ origin: config.corsOrigin }))
    app.use(express.json())

    app.use(apiRouter({ db, config }))

    if (config.staticDir) {
        app.use(express.static(config.staticDir))

        // rotas do React (/chamados, /chamado/3...): qualquer GET que nao e da API devolve o index.html
        app.use((req, res, next) => {
            if (req.method !== 'GET') {
                return next()
            }

            res.sendFile(path.resolve(config.staticDir, 'index.html'))
        })
    }

    app.use(notFound)
    app.use(errorHandler)

    return app
}
