import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { createRetrieverTool } from "langchain/tools/retriever";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { NextResponse } from "next/server";

function FormatMessage(messages: Message[]): BaseMessage[] {
    const AllMessages: BaseMessage[] = [];
    for (const message of messages) {
        if (message.role === "user") {
            AllMessages.push(new HumanMessage(message.content));
        } else {
            AllMessages.push(new AIMessage(message.content));
        }
    }
    return AllMessages;
}

export async function POST(req: Request){
    try{
        const body = await req.json()
        const messages = body.messages;
        const input = body.input;

        const AllMessages = FormatMessage(messages)
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)

        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings,
            {pineconeIndex},
        )
        const retriever =  vectorStore.asRetriever({ k: 6, searchType: "similarity" })

        const retriverTool = createRetrieverTool(retriever, 
            {
                name:"retriver_agent",
                description: "search for the information that user asked about the pdf for the webpage , you must use this tool"
            }
        )

        const tool = [retriverTool]

        const chat = new ChatOpenAI({
            model: "gpt-3.5-turbo",
            temperature: 0,
          });

        const prompt = await pull<ChatPromptTemplate>(
            "hwchase17/openai-functions-agent"
        );

        const agent = await createToolCallingAgent({
            llm: chat,
            tools: tool,
            prompt,
          });

        const agentExecutor = new AgentExecutor({
            agent, 
            tools: tool
        })
        const result = await agentExecutor.invoke(
            {
                input: input,
                chat_history: AllMessages
            }
        )
        return NextResponse.json({ok: true, message: result.output, status: 200})
    }

    catch(e: any){
        return NextResponse.json({error: e.message}, { status: 500})
    }

}