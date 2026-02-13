import { createServer } from 'http'
import { env } from './env'
import express from 'express'
import cors from 'cors'
import { authRouter } from './Authentification/auth.route'
import { cardsRouter } from './Cards/cards.route'
import { deckRouter } from './deck/deck.route'




// Create Express app
export const app = express()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// Middlewares
app.use(
  cors({
    origin: true, // Autorise toutes les origines
    credentials: true,
  }),
)

app.use(express.json())

// Serve static files (Socket.io test client)
app.use(express.static('public'))

/**
 * GET /api/health
 * Health check endpoint to verify server status.
 * @param {Request} _req - Express request object (not used)
 * @param {Response} res - Express response object
 * @returns {void} JSON response with server status
 * @example
 * GET /api/health
 * Response: { "status": "ok", "message": "TCG Backend Server is running" }
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TCG Backend Server is running' })
})

// Auth routes
app.use('/api/auth', authRouter)

// Cards routes
app.use('/api/cards', cardsRouter)

// Deck routes
app.use('/api/decks', deckRouter)

// Start server only if this file is run directly (not imported for tests)
if (require.main === module) {
  // Create HTTP server
  const httpServer = createServer(app)

  // Start server
  try {
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${env.PORT}`)
      console.log(`\n🧪 Socket.io Test Client available at http://localhost:${env.PORT}`,
      )
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

console.log('test');