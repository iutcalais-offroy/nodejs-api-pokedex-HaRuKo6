import { Request, Response } from 'express'
import { DeckService } from './deck.service'

export const createDeck = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, cards } = req.body
        const userId = req.user!.userId

        const deck = await DeckService.createDeck(userId, name, cards)

        res.status(201).json(deck)
        return
    } catch (error) {
        console.error('Create deck error:', error)
        if (error instanceof Error) {
            if (error.message.includes('required') || error.message.includes('10 cards') || error.message.includes('invalid') || error.message.includes('duplicate')) {
                res.status(400).json({ error: error.message })
                return
            }
        }
        res.status(500).json({ error: 'Internal server error' })
        return
    }
}

export const getUserDecks = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId

        const decks = await DeckService.getUserDecks(userId)

        res.status(200).json(decks)
        return
    } catch (error) {
        console.error('Get user decks error:', error)
        res.status(500).json({ error: 'Internal server error' })
        return
    }
}

export const getDeckById = async (req: Request, res: Response): Promise<void> => {
    try {
        const deckId = parseInt(req.params.id)
        const userId = req.user!.userId

        if (isNaN(deckId)) {
            res.status(400).json({ error: 'Invalid deck ID' })
            return
        }

        const deck = await DeckService.getDeckById(deckId, userId)

        res.status(200).json(deck)
        return
    } catch (error) {
        console.error('Get deck by ID error:', error)
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({ error: 'Deck not found' })
            return
        }
        res.status(500).json({ error: 'Internal server error' })
        return
    }
}

export const updateDeck = async (req: Request, res: Response): Promise<void> => {
    try {
        const deckId = parseInt(req.params.id)
        const { name, cards } = req.body
        const userId = req.user!.userId

        if (isNaN(deckId)) {
            res.status(400).json({ error: 'Invalid deck ID' })
            return
        }

        const deck = await DeckService.updateDeck(deckId, userId, name, cards)

        res.status(200).json(deck)
        return
    } catch (error) {
        console.error('Update deck error:', error)
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: 'Deck not found' })
                return
            }
            if (error.message.includes('required') || error.message.includes('10 cards') || error.message.includes('invalid') || error.message.includes('duplicate') || error.message.includes('empty')) {
                res.status(400).json({ error: error.message })
                return
            }
        }
        res.status(500).json({ error: 'Internal server error' })
        return
    }
}

export const deleteDeck = async (req: Request, res: Response): Promise<void> => {
    try {
        const deckId = parseInt(req.params.id)
        const userId = req.user!.userId

        if (isNaN(deckId)) {
            res.status(400).json({ error: 'Invalid deck ID' })
            return
        }

        await DeckService.deleteDeck(deckId, userId)

        res.status(200).json({ message: 'Deck deleted successfully' })
        return
    } catch (error) {
        console.error('Delete deck error:', error)
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({ error: 'Deck not found' })
            return
        }
        res.status(500).json({ error: 'Internal server error' })
        return
    }
}
