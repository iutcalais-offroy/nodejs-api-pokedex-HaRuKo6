import { DeckRepository } from './deck.repository'

export class DeckService {
    /**
     * Creates a new deck for a user with validation.
     * Validates deck name, card count, uniqueness, and existence.
     * @param {number} userId - The ID of the user creating the deck
     * @param {string} name - The name of the deck
     * @param {number[]} cardIds - Array of exactly 10 unique card IDs
     * @returns {Promise<any>} The created deck with its associated cards
     * @throws {Error} If name is empty, card count is not 10, cards are duplicated, or some cards don't exist
     */
    static async createDeck(userId: number, name: string, cardIds: number[]) {
        // Validation des données
        if (!name || name.trim().length === 0) {
            throw new Error('Deck name is required')
        }

        if (!cardIds || !Array.isArray(cardIds) || cardIds.length !== 10) {
            throw new Error('Exactly 10 cards are required')
        }

        // Vérifier les doublons
        const uniqueCardIds = [...new Set(cardIds)]
        if (uniqueCardIds.length !== cardIds.length) {
            throw new Error('Duplicate card IDs are not allowed')
        }

        // Vérifier que toutes les cartes existent
        const existingCardIds = await DeckRepository.validateCardIds(cardIds)
        if (existingCardIds.length !== cardIds.length) {
            throw new Error('Some card IDs are invalid')
        }

        // Créer le deck
        return await DeckRepository.createDeck(userId, name.trim(), cardIds)
    }

    /**
     * Retrieves all decks belonging to a specific user.
     * @param {number} userId - The ID of the user whose decks to retrieve
     * @returns {Promise<any[]>} Array of decks with their associated cards and card details
     */
    static async getUserDecks(userId: number) {
        return await DeckRepository.getUserDecks(userId)
    }

    /**
     * Retrieves a specific deck by ID for a user.
     * Ensures the deck belongs to the requesting user.
     * @param {number} deckId - The ID of the deck to retrieve
     * @param {number} userId - The ID of the user who owns the deck
     * @returns {Promise<any>} The deck with its associated cards
     * @throws {Error} If deck not found or doesn't belong to user
     */
    static async getDeckById(deckId: number, userId: number) {
        const deck = await DeckRepository.getDeckByIdAndUser(deckId, userId)
        if (!deck) {
            throw new Error('Deck not found')
        }
        return deck
    }

    /**
     * Updates an existing deck's name and/or cards.
     * Validates ownership, name, and card requirements.
     * @param {number} deckId - The ID of the deck to update
     * @param {number} userId - The ID of the user who owns the deck
     * @param {string} [name] - Optional new name for the deck
     * @param {number[]} [cardIds] - Optional array of exactly 10 unique card IDs
     * @returns {Promise<any>} The updated deck with its associated cards
     * @throws {Error} If deck not found, name is empty, or card validation fails
     */
    static async updateDeck(deckId: number, userId: number, name?: string, cardIds?: number[]) {
        // Vérifier que le deck existe et appartient à l'utilisateur
        const existingDeck = await DeckRepository.getDeckByIdAndUser(deckId, userId)
        if (!existingDeck) {
            throw new Error('Deck not found')
        }

        // Validation du nom si fourni
        const finalName = name !== undefined ? name : existingDeck.name
        if (!finalName || finalName.trim().length === 0) {
            throw new Error('Deck name cannot be empty')
        }

        // Validation des cartes si fournies
        let finalCardIds = existingDeck.deckCards.map(dc => dc.cardId)
        if (cardIds !== undefined) {
            if (!Array.isArray(cardIds) || cardIds.length !== 10) {
                throw new Error('Exactly 10 cards are required')
            }

            // Vérifier les doublons
            const uniqueCardIds = [...new Set(cardIds)]
            if (uniqueCardIds.length !== cardIds.length) {
                throw new Error('Duplicate card IDs are not allowed')
            }

            // Vérifier que toutes les cartes existent
            const existingCardIds = await DeckRepository.validateCardIds(cardIds)
            if (existingCardIds.length !== cardIds.length) {
                throw new Error('Some card IDs are invalid')
            }

            finalCardIds = cardIds
        }

        // Mettre à jour le deck
        return await DeckRepository.updateDeck(deckId, userId, finalName.trim(), finalCardIds)
    }

    /**
     * Deletes a deck and all its associated cards.
     * Ensures the deck belongs to the user before deletion.
     * @param {number} deckId - The ID of the deck to delete
     * @param {number} userId - The ID of the user who owns the deck
     * @returns {Promise<void>} Resolves when deletion is complete
     * @throws {Error} If deck not found or doesn't belong to user
     */
    static async deleteDeck(deckId: number, userId: number) {
        // Vérifier que le deck existe et appartient à l'utilisateur
        const existingDeck = await DeckRepository.getDeckByIdAndUser(deckId, userId)
        if (!existingDeck) {
            throw new Error('Deck not found')
        }

        // Supprimer le deck
        return await DeckRepository.deleteDeck(deckId, userId)
    }
}
