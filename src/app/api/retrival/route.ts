import 'cheerio'
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";


import { Pinecone } from '@pinecone-database/pinecone';

import { PineconeStore } from "@langchain/pinecone";
import { NextResponse } from 'next/server';


export async function POST(req: Request){
    const body = await req.json();
    const link = body.link;
    const pinecone = new Pinecone();
    const index = await pinecone.listIndexes();
    const indexes = index.indexes;

    try{
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
        const loader =  new CheerioWebBaseLoader(link)
        const rawDocs = await loader.load();
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

        // console.log(vectorstore)
        

        return NextResponse.json({ok: true }, {status: 200})
    } catch (e: any) {
        return NextResponse.json({error: e.message}, { status: 500})
    }
}