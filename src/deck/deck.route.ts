import { Router } from 'express'
import { authenticateToken } from '../Authentification/auth.route'
import { createDeck, getUserDecks, getDeckById, updateDeck, deleteDeck } from './deck.contoleur'

export const deckRouter = Router()

// Appliquer le middleware d'authentification à toutes les routes
deckRouter.use(authenticateToken)

// POST /api/decks - Créer un nouveau deck
deckRouter.post('/', createDeck)

// GET /api/decks/mine - Lister les decks de l'utilisateur
deckRouter.get('/mine', getUserDecks)

// GET /api/decks/:id - Consulter un deck spécifique
deckRouter.get('/:id', getDeckById)

// PATCH /api/decks/:id - Modifier un deck
deckRouter.patch('/:id', updateDeck)

// DELETE /api/decks/:id - Supprimer un deck
deckRouter.delete('/:id', deleteDeck)
