import { Router } from 'express'
import { authenticateToken } from '../Authentification/auth.route'
import { createDeck, getUserDecks, getDeckById, updateDeck, deleteDeck } from './deck.contoleur'

export const deckRouter = Router()

// Appliquer le middleware d'authentification à toutes les routes
deckRouter.use(authenticateToken)

/**
 * POST /api/decks
 * Creates a new deck for the authenticated user.
 * Requires authentication token in header.
 * @param {Request} req - Express request object with deck data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created deck or error
 * @throws {Error} Returns 400 for validation errors, 500 for internal server errors
 * @example
 * POST /api/decks
 * Authorization: Bearer <token>
 * Body: { "name": "My Deck", "cards": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
 * Response: { "id": 1, "name": "My Deck", "userId": 1, "createdAt": "2023-01-01T00:00:00.000Z", "updatedAt": "2023-01-01T00:00:00.000Z", "deckCards": [...] }
 */
deckRouter.post('/', createDeck)

// GET /api/decks/mine - Lister les decks de l'utilisateur
deckRouter.get('/mine', getUserDecks)

/**
 * GET /api/decks/:id
 * Retrieves a specific deck by ID for the authenticated user.
 * Ensures the deck belongs to the requesting user.
 * Requires authentication token in header.
 * @param {Request} req - Express request object with deck ID in params and user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with deck details or error
 * @throws {Error} Returns 400 for invalid deck ID, 404 if deck not found or doesn't belong to user, 500 for internal server errors
 * @example
 * GET /api/decks/1
 * Authorization: Bearer <token>
 * Response: { "id": 1, "name": "My Deck", "userId": 1, "createdAt": "2023-01-01T00:00:00.000Z", "updatedAt": "2023-01-01T00:00:00.000Z", "deckCards": [...] }
 */
deckRouter.get('/:id', getDeckById)

// PATCH /api/decks/:id - Modifier un deck
deckRouter.patch('/:id', updateDeck)

/**
 * DELETE /api/decks/:id
 * Deletes a deck belonging to the authenticated user.
 * Permanently removes the deck and all its associated cards.
 * Requires authentication token in header.
 * @param {Request} req - Express request object with deck ID in params and user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with success message or error
 * @throws {Error} Returns 400 for invalid deck ID, 404 if deck not found or doesn't belong to user, 500 for internal server errors
 * @example
 * DELETE /api/decks/1
 * Authorization: Bearer <token>
 * Response: { "message": "Deck deleted successfully" }
 */
deckRouter.delete('/:id', deleteDeck)
