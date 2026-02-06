import { prisma } from '../database'

export class DeckRepository {
    /**
     * Creates a new deck with associated cards for a user.
     * @param {number} userId - The ID of the user creating the deck
     * @param {string} name - The name of the deck
     * @param {number[]} cardIds - Array of exactly 10 card IDs to associate with the deck
     * @returns {Promise<any>} The created deck with its associated cards and card details
     */
    static async createDeck(userId: number, name: string, cardIds: number[]) {
        if (cardIds.length !== 10) {
            throw new Error('Exactly 10 cards are required')
        }
        return await prisma.deck.create({
            data: {
                name,
                userId,
                deckCards: {
                    create: cardIds.map(cardId => ({ cardId }))
                }
            },
            include: {
                deckCards: {
                    include: {
                        card: true
                    }
                }
            }
        })
    }

    // Récupérer tous les decks d'un utilisateur
    static async getUserDecks(userId: number) {
        return await prisma.deck.findMany({
            where: { userId },
            include: {
                deckCards: {
                    include: {
                        card: true
                    }
                }
            }
        })
    }

    /**
     * Retrieves a specific deck by ID for a user.
     * Ensures the deck belongs to the specified user.
     * @param {number} deckId - The ID of the deck to retrieve
     * @param {number} userId - The ID of the user who owns the deck
     * @returns {Promise<any|null>} The deck with its associated cards and card details, or null if not found
     */
    static async getDeckByIdAndUser(deckId: number, userId: number) {
        return await prisma.deck.findFirst({
            where: {
                id: deckId,
                userId: userId
            },
            include: {
                deckCards: {
                    include: {
                        card: true
                    }
                }
            }
        })
    }

    /**
     * Updates a deck's name and associated cards.
     * Replaces all existing card associations with new ones.
     * @param {number} deckId - The ID of the deck to update
     * @param {number} userId - The ID of the user who owns the deck
     * @param {string} name - The new name for the deck
     * @param {number[]} cardIds - Array of 10 card IDs to associate with the deck
     * @returns {Promise<any>} The updated deck with its associated cards
     */
    static async updateDeck(deckId: number, userId: number, name: string, cardIds: number[]) {
        if (cardIds.length !== 10) {
            throw new Error('Exactly 10 cards are required')
        }
        // Supprimer les anciennes associations
        await prisma.deckCard.deleteMany({
            where: { deckId }
        })

        // Mettre à jour le deck et créer les nouvelles associations
        return await prisma.deck.update({
            where: {
                id: deckId,
                userId: userId
            },
            data: {
                name,
                deckCards: {
                    create: cardIds.map(cardId => ({ cardId }))
                }
            },
            include: {
                deckCards: {
                    include: {
                        card: true
                    }
                }
            }
        })
    }

    /**
     * Deletes a deck and all its associated card relationships.
     * @param {number} deckId - The ID of the deck to delete
     * @param {number} userId - The ID of the user who owns the deck
     * @returns {Promise<any>} The deleted deck object
     */
    static async deleteDeck(deckId: number, userId: number) {
        // Supprimer les associations DeckCard d'abord
        await prisma.deckCard.deleteMany({
            where: { deckId }
        })

        // Supprimer le deck
        return await prisma.deck.delete({
            where: {
                id: deckId,
                userId: userId
            }
        })
    }

    /**
     * Validates that all provided card IDs exist in the database.
     * @param {number[]} cardIds - Array of card IDs to validate
     * @returns {Promise<number[]>} Array of existing card IDs
     */
    static async validateCardIds(cardIds: number[]) {
        const cards = await prisma.card.findMany({
            where: {
                id: { in: cardIds }
            },
            select: { id: true }
        })
        return cards.map(card => card.id)
    }
}
