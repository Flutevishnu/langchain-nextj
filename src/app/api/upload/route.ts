import { NextResponse } from "next/server"
import { promises as fs } from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
export async function POST(req: Request) {
    try 
    {
        const form = await req.formData();
        const file = form.get("file");
        console.log(file)

        if (file && file instanceof File) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            console.log("filebuffer", fileBuffer)
            const uploadDir = path.join(process.cwd(), "uploads");

            // Ensure the upload directory exists
            await fs.mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, file.name);
            await fs.writeFile(filePath, fileBuffer);
            
            console.log(`File saved to ${filePath}`);
            
            const pinecone = new Pinecone();
            const index = await pinecone.listIndexes();
            const indexes = index.indexes;

           
                if (indexes && indexes.length === 0) {
                    await pinecone.createIndex({
                        name: 'langchain-starter',
                        dimension: 1536,
                        metric: 'cosine',
                        spec: {
                          serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                          }
                        }
                      });
                }
                else {
                    await pinecone.deleteIndex('langchain-starter');
                    await pinecone.createIndex({
                        name: 'langchain-starter',
                        dimension: 1536,
                        metric: 'cosine',
                        spec: {
                          serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                          }
                        }
                      });
                }
                const loader = new PDFLoader(filePath);
                const rawDocs = await loader.load();
                if (rawDocs) {
                    await fs.unlink(filePath)
                    console.log(`File ${filePath} has been removed`);
                }
                const textsplitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 500,
                    chunkOverlap: 20,
                })
        
                const allSplits = await textsplitter.splitDocuments(rawDocs);
        
                
                const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)
        
                const vectorstore = await PineconeStore.fromDocuments(
                    allSplits,
                    new OpenAIEmbeddings(),
                    {
                        pineconeIndex,
                        maxConcurrency: 5,
                    }
                );

            return NextResponse.json({ ok: true, message: `File saved to ${filePath}` }, { status: 200 });
        }
        else 
        {
            throw new Error("No file uploaded");
        }
    } catch (error) {
        console.error("Error processing form data:", error);
        return NextResponse.json({ ok: false}, { status: 500 });
    }
}