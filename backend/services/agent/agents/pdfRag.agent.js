// import fs from "fs";
// import {PDFParse} from "pdf-parse";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { createVectorStore } from "../utils/vectorStore.js";
// import {
//   HumanMessage,
//   SystemMessage
// } from "@langchain/core/messages";

// import { getModel }
// from "../utils/model.js";
// import { QdrantVectorStore } from "@langchain/qdrant";
// export const pdfRagAgent = async (state) => {

//   try {

//     const buffer =
//       fs.readFileSync(
//         state.file.path
//       );

//     const pdf =
//       new PDFParse({

//         data: buffer

//       });

//     const result =await pdf.getText();

//     const text = result.text;

//     const splitter = new RecursiveCharacterTextSplitter({
//         chunkSize: 1000,
//         chunkOverlap: 200

//       });

//     const docs =await splitter.createDocuments([text]);
//    const collectionName =`pdf-${Date.now()}`;

// const vectorStore =await createVectorStore(
// collectionName,
// docs
// );

// const relevantDocs =await vectorStore.similaritySearch(

//     state.prompt,

//     5

// );
// console.log(relevantDocs);
// const context =
// relevantDocs

// .map(doc=>doc.pageContent)

// .join("\n\n");
// const llm =getModel("pdf-rag");

//     const messages=[

// new SystemMessage(`

// You are NabhiAI PDF Assistant.

// Rules:

// - Answer ONLY from the uploaded PDF.

// - Never make up information.

// - If the answer is not present in the PDF, reply:

// "I couldn't find this information in the uploaded PDF."

// - Use Markdown formatting.

// `),

// new HumanMessage(`

// Context:

// ${context}

// Question:

// ${state.prompt}

// `)
// ];


// const response =
// await llm.invoke(
//     messages
// );


//     return {

//       ...state,

//       docs,

//       response:
// response.content
//     };

    



//   }

//  finally{

//     try{

//         fs.unlinkSync(
//             state.file.path
//         );

//         await QdrantVectorStore.deleteCollection(

//             collectionName

//         );

//     }

//     catch(err){

//         console.log(err.message);

//     }

// }

// };


import fs from "fs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createVectorStore } from "../utils/vectorStore.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../utils/model.js";
import { QdrantClient } from "@qdrant/js-client-rest"; 
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const pdfRagAgent = async (state) => {
  let collectionName;

  try {
    const loader = new PDFLoader(state.file.path);
    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.splitDocuments(rawDocs);
    collectionName = `pdf-${Date.now()}`;

    const vectorStore = await createVectorStore(collectionName, docs);

    const relevantDocs = await vectorStore.similaritySearch(state.prompt, 5);
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");
    const llm = getModel("pdf-rag");

    const messages = [
      new SystemMessage(`
You are NabhiAI PDF Assistant.
Rules:
- Answer based on the uploaded PDF.
- If the user asks a general question like "ye kya hai" or "what is this", summarize what the document is about using the provided context.
- Never make up external information.
- Use Markdown formatting.
`),
      new HumanMessage(`
Context:
${context}

Question:
${state.prompt}
`),
    ];

    const response = await llm.invoke(messages);

    return {
      ...state,
      docs,
      response: response.content,
    };
// ... aapka upar ka code
  } finally {
    try {
      if (state.file && state.file.path && fs.existsSync(state.file.path)) {
        fs.unlinkSync(state.file.path);
      }
      
      if (collectionName) {
        const client = new QdrantClient({
          url: "https://e28a9612-e6f7-4b9b-8fd4-d8ea3b3d5b2a.eu-west-2-0.aws.cloud.qdrant.io",
          apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6NTNhMDYyMDAtMTI3MS00OGQxLTk4N2UtMzMwN2YyMjcxNjllIn0.4cW7w0I9QwfB5kY8CZAwjt6vlePSkB47-TBBySkv5cM",
          port: 443 // <--- YAHAN BHI FORCE PORT 443
        });
        await client.deleteCollection(collectionName);
      }
    } catch (err) {
      console.log("Cleanup Error:", err.message);
    }
  }
};