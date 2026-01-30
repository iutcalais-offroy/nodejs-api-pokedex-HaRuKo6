import { prisma } from '../database'

export class DeckRepository {
    // Créer un deck avec ses cartes
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

    // Récupérer un deck par ID et userId
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

    // Mettre à jour un deck
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

    // Supprimer un deck
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

    // Vérifier si les cartes existent
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
