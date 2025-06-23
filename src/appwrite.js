import { Client, Databases, ID, Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client().setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('searchTerm', searchTerm)]);
        if (result.total > 0) {
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            });
        }
        if (result.total === 0) {
            // If no document exists, create a new one
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: searchTerm,
                count: 1,
                movieId: movie.id,
                posterUrl: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            });
        }
    } catch (err) {
        console.log(err);
    }
}
export const getTrendingMovies = async () => {try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderDesc('count'),
        Query.limit(5)
    ]);
    return result.documents;
} catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
}