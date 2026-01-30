import { Request, Response, Router } from 'express'
import { prisma } from '../database'

export const cardsRouter = Router()

// GET /api/cards
cardsRouter.get('/', async (_req: Request, res: Response) => {
    try {
        // Récupérer toutes les cartes triées par pokedexNumber croissant
        const cards = await prisma.card.findMany({
            orderBy: {
                pokedexNumber: 'asc'
            }
        })

        // Retourner la liste des cartes
        res.status(200).json(cards)
    } catch (error) {
        console.error('Error fetching cards:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})
