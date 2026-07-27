import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest"; 
import { embeddings } from "./embedding.js";

export const createVectorStore = async (collectionName, docs) => {
    // Client banate waqt forcefully port 443 set kar diya
    const client = new QdrantClient({
        url: "https://e28a9612-e6f7-4b9b-8fd4-d8ea3b3d5b2a.eu-west-2-0.aws.cloud.qdrant.io",
        apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6NTNhMDYyMDAtMTI3MS00OGQxLTk4N2UtMzMwN2YyMjcxNjllIn0.4cW7w0I9QwfB5kY8CZAwjt6vlePSkB47-TBBySkv5cM",
        port: 443 // <--- YE HAI WO MAGIC FIX
    });

    return await QdrantVectorStore.fromDocuments(
        docs, 
        embeddings, 
        {
            client: client,
            collectionName: collectionName
        }
    );
};