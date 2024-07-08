
import { Calculator } from "@langchain/community/tools/calculator";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts"
import { pull } from "langchain/hub"

import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { NextResponse } from "next/server";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";

export async function POST(req: Request){

    const body = await req.json();
    const messages = body.messages;
    const input: string= body.input
    const messageHistory = new ChatMessageHistory();
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


    const agentWithMessageHistory = new RunnableWithMessageHistory({
        runnable: agentExecutor,
        getMessageHistory: (sessionId)=> messageHistory,
        inputMessagesKey: "input",
        historyMessagesKey: "chat_history",
    })

    

    const result = await agentWithMessageHistory.invoke(
        {
        input: input,
        chat_history: {...messages}
        },
        {
            configurable: {
                sessionId: "foo",
            },
        }
    )
 
    

    return NextResponse.json({ok: true, message: result})
}

