import { Request, Response, Router } from 'express'
import { prisma } from '../database'

export const cardsRouter = Router()

/**
 * GET /api/cards
 * Retrieves all cards from the database, sorted by Pokedex number.
 * @param {Request} _req - Express request object (not used)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of cards or error
 * @throws {Error} Returns 500 for internal server errors
 * @example
 * GET /api/cards
 * Response: [{ "id": 1, "name": "Bulbasaur", "pokedexNumber": 1, ... }, ...]
 */
cardsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // Récupérer toutes les cartes triées par pokedexNumber croissant
    const cards = await prisma.card.findMany({
      orderBy: {
        pokedexNumber: 'asc',
      },
    })

    // Retourner la liste des cartes
    res.status(200).json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
