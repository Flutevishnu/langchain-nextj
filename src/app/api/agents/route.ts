
import { Calculator } from "@langchain/community/tools/calculator";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts"
import { pull } from "langchain/hub"
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { NextResponse } from "next/server";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";

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

    const body = await req.json();
    const messages = body.messages;
    const input: string= body.input
    const AllMessages = FormatMessage(messages)
    // const messageHistory = new ChatMessageHistory();
    const searchapi = new SerpAPI();
    const calcApi = new Calculator();

    const tools = [searchapi, calcApi]

    const prompt = await pull<ChatPromptTemplate>(
        "hwchase17/openai-functions-agent"
    )

    const chat = new ChatOpenAI({
        model: "gpt-3.5-turbo"  ,
        temperature: 0
    })

    const agent = await createToolCallingAgent({
        llm: chat,
        tools,
        prompt,
      });

    const agentExecutor = new AgentExecutor({
        agent, 
        tools
    })

    console.log(AllMessages)
    const result = await agentExecutor.invoke({
        input: input,
        chat_history: AllMessages
      });


    // const agentWithMessageHistory = new RunnableWithMessageHistory({
    //     runnable: agentExecutor,
    //     getMessageHistory: (_sessionId)=> messageHistory,
    //     inputMessagesKey: "input",
    //     historyMessagesKey: "chat_history",
    // })

    
    // console.log(...messages)
    // const result = await agentWithMessageHistory.invoke(
    //     {
    //     input: input,
    //     chat_history: {...messages}
    //     },
    //     {
    //         configurable: {
    //             sessionId: "foo",
    //         },
    //     }
    // )
 
    return NextResponse.json({ok: true, message: result.output, status: 200})
}

