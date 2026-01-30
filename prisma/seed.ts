import bcrypt from "bcryptjs";
import {readFileSync} from "fs";
import {join} from "path";
import {prisma} from "../src/database";
import {CardModel} from "../src/generated/prisma/models/Card";
import {PokemonType} from "../src/generated/prisma/enums";

async function main() {
    console.log("🌱 Starting database seed...");

    await prisma.deckCard.deleteMany();
    await prisma.deck.deleteMany();
    await prisma.card.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.createMany({
        data: [
            {
                username: "red",
                email: "red@example.com",
                password: hashedPassword,
            },
            {
                username: "blue",
                email: "blue@example.com",
                password: hashedPassword,
            },
        ],
    });

    const redUser = await prisma.user.findUnique({where: {email: "red@example.com"}});
    const blueUser = await prisma.user.findUnique({where: {email: "blue@example.com"}});

    if (!redUser || !blueUser) {
        throw new Error("Failed to create users");
    }

    console.log("✅ Created users:", redUser.username, blueUser.username);

    const pokemonDataPath = join(__dirname, "data", "pokemon.json");
    const pokemonJson = readFileSync(pokemonDataPath, "utf-8");
    const pokemonData: CardModel[] = JSON.parse(pokemonJson);

    const createdCards = await Promise.all(
        pokemonData.map((pokemon) =>
            prisma.card.create({
                data: {
                    name: pokemon.name,
                    hp: pokemon.hp,
                    attack: pokemon.attack,
                    type: PokemonType[pokemon.type as keyof typeof PokemonType],
                    pokedexNumber: pokemon.pokedexNumber,
                    imgUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokedexNumber}.png`,
                },
            })
        )
    );

    // Fonction pour créer un deck avec 10 cartes aléatoires
    async function createDeckRandom(userId: number, deckName: string) {
        // Créer le deck
        const deck = await prisma.deck.create({
            data: {
                name: deckName,
                userId: userId,
            },
        });

        // Obtenir tous les IDs des cartes créées
        const cardIds = createdCards.map(card => card.id);

        // Sélectionner 10 cartes aléatoires sans répétition
        const selectedCardIds: number[] = [];
        while (selectedCardIds.length < 10) {
            const randomIndex = Math.floor(Math.random() * cardIds.length);
            const randomCardId = cardIds[randomIndex];
            if (!selectedCardIds.includes(randomCardId)) {
                selectedCardIds.push(randomCardId);
            }
        }

        // Créer les associations DeckCard
        await prisma.deckCard.createMany({
            data: selectedCardIds.map(cardId => ({
                deckId: deck.id,
                cardId: cardId,
            })),
        });

        return deck;
    }

    // Créer les decks pour Red et Blue
    const redDeck = await createDeckRandom(redUser.id, "Starter Deck");
    const blueDeck = await createDeckRandom(blueUser.id, "Starter Deck");

    console.log(" Created starter decks with 10 random cards for both users");

    console.log(`✅ Created ${pokemonData.length} Pokemon cards`);

    console.log("\n🎉 Database seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
