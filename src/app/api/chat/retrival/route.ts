import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextResponse } from "next/server";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
  } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import type { BaseMessage } from "@langchain/core/messages";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { RunnableBranch } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";


const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context. 
  If the context doesn't contain any relevant information to the question, don't make something up and say what you know:
  
  <context>
  {context}
  </context>
  `;

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

export async function POST(req: Request) {

    const body = await req.json()
    const message = body.messages;
    const input = body.input;
    const AllMessages = FormatMessage(message)
    console.log(AllMessages)
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!)

    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings,
        {pineconeIndex},
    )
    const retriever =  vectorStore.asRetriever({ k: 6, searchType: "similarity" })


    const questionanswerpromt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_TEMPLATE],
        new MessagesPlaceholder('messages')
    ]);

    const llm = new ChatOpenAI({
        model: "gpt-3.5-turbo",
        temperature: 0
    });
    

    const documentchain = await createStuffDocumentsChain({
        llm,
        prompt: questionanswerpromt
    })


    const parseRetrieverInput = (params: {messages: BaseMessage[]}) => {
        return params.messages[params.messages.length-1].content
    }

    const queryTransformPrompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder("messages"),
        [
          "user",
          "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
        ],
      ]);


    const queryTransformimgRetrieverChain = RunnableBranch.from([
        [
            (params: {messages: BaseMessage[]}) => params.messages.length === 1,
            RunnableSequence.from([parseRetrieverInput, retriever]),
        ],
        queryTransformPrompt.pipe(llm).pipe(new StringOutputParser()).pipe(retriever),
    ]).withConfig({runName: "chat_retriever_chain"});

    const conversationalretrievalChain = RunnablePassthrough.assign({
        context: queryTransformimgRetrieverChain,
    }).assign({
        answer: documentchain
    });

    const result = await conversationalretrievalChain.invoke({
        messages : AllMessages
        })

    console.log("RESULSSSSSSSSSSSSSSSSSSSSSSSSSSS",  result)

    return NextResponse.json({message: result.answer}, {status: 200}, )
}