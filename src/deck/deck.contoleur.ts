import { Request, Response } from 'express'
import { DeckService } from './deck.service'

/**
 * Creates a new deck for the authenticated user.
 * Validates deck requirements and associates cards with the deck.
 * @param {Request} req - Express request object with deck data in body and user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created deck or error
 * @throws {Error} Returns 400 for validation errors, 500 for internal server errors
 * @example
 * Body: { "name": "My Deck", "cards": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
 * Response: { "id": 1, "name": "My Deck", "userId": 1, "createdAt": "2023-01-01T00:00:00.000Z", "updatedAt": "2023-01-01T00:00:00.000Z", "deckCards": [...] }
 */
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

/**
 * Retrieves all decks belonging to the authenticated user.
 * @param {Request} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of user's decks or error
 * @throws {Error} Returns 500 for internal server errors
 * @example
 * GET /api/decks
 * Response: [{ "id": 1, "name": "My Deck", "userId": 1, "createdAt": "2023-01-01T00:00:00.000Z", "updatedAt": "2023-01-01T00:00:00.000Z", "deckCards": [...] }, ...]
 */
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

/**
 * Retrieves a specific deck by ID for the authenticated user.
 * Ensures the deck belongs to the requesting user.
 * @param {Request} req - Express request object with deck ID in params and user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with deck details or error
 * @throws {Error} Returns 400 for invalid deck ID
 * @throws {Error} Returns 404 if deck not found or doesn't belong to user
 * @throws {Error} Returns 500 for internal server errors
 * @example
 * GET /api/decks/1
 * Response: { "id": 1, "name": "My Deck", "userId": 1, "createdAt": "2023-01-01T00:00:00.000Z", "updatedAt": "2023-01-01T00:00:00.000Z", "deckCards": [...] }
 */
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

/**
 * Updates an existing deck belonging to the authenticated user.
 * Validates updated deck requirements and ensures ownership.
 * @param {Request} req - Express request object with deck ID in params, update data in body, and user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated deck or error
 * @throws {Error} Returns 400 for invalid deck ID or validation errors
 * @throws {Error} Returns 404 if deck not found or doesn't belong to user
 * @throws {Error} Returns 500 for internal server errors
 * @example
 * PUT /api/decks/1
 * Body: { "name": "Updated Deck", "cards": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
 * Response: { "id": 1, "name": "Updated Deck", "userId": 1, "createdAt": "2023-01-01T00:00:00.000Z", "updatedAt": "2023-01-01T00:00:00.000Z", "deckCards": [...] }
 */
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

/**
 * Deletes a deck belonging to the authenticated user.
 * Permanently removes the deck and all its associated cards.
 * @param {Request} req - Express request object with deck ID in params and user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with success message or error
 * @throws {Error} Returns 400 for invalid deck ID
 * @throws {Error} Returns 404 if deck not found or doesn't belong to user
 * @throws {Error} Returns 500 for internal server errors
 * @example
 * DELETE /api/decks/1
 * Response: { "message": "Deck deleted successfully" }
 */
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
