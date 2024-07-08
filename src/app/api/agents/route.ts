
import { Calculator } from "@langchain/community/tools/calculator";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts"
import { pull } from "langchain/hub"

import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { NextResponse } from "next/server";
import { SerpAPI } from "@langchain/community/tools/serpapi";


export async function POST(req: Request){

    const body = await req.json();
    const message = body.messages;

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

     // Log the input message
    console.log("Input message:", message);

    const result = await agentExecutor.invoke({
         input: message
    });
 
     // Log the result
    console.log("Result:", result);

    return NextResponse.json({ok: true, message: result})
}

