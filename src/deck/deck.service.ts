import { DeckRepository } from './deck.repository'

export class DeckService {
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

    static async getUserDecks(userId: number) {
        return await DeckRepository.getUserDecks(userId)
    }

    static async getDeckById(deckId: number, userId: number) {
        const deck = await DeckRepository.getDeckByIdAndUser(deckId, userId)
        if (!deck) {
            throw new Error('Deck not found')
        }
        return deck
    }

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
