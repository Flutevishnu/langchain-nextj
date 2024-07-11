import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";

const TEMPLATE = `Extract the requested fields from the input.

The field "entity" refers to the first mentioned entity in the input.

Input:

{input}`;

export async function POST(req: Request){
    try{
        const body =await req.json()
        const messages = body.messages
        const input = body.input

        const prompt = new ChatPromptTemplate(
            {
                promptMessages: [
                    SystemMessagePromptTemplate.fromTemplate('Extract the requested fields from the input.The field "entity" refers to the first mentioned entity in the input.'),
                    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
                ],
                inputVariables: ["inputText"]
            }
        )

        const model = new ChatOpenAI({
            model: "gpt-3.5-turbo", 
            temperature: 0
        })

        const schema = z.object({
            tone: z.enum(["Positive", "Negative", "Neutral"]).describe("The over all tune of the input"),
            entity: z.string().describe("The  entity mentioned in the input"),
            wordcount: z.number().describe("The  number of words in the input"),
            chat_response: z.string().describe("The response to the human input"),
            final_punctuation: z.optional(z.string()).describe("The final punctuation mark in the input, if any.")

        })

        const functionCallingModel = model.bind({
            functions:  [
                {
                name: "output_formatter", 
                description: "Should always be used  to  properly format output",
                parameters: zodToJsonSchema(schema)
                },
            ],
            function_call: { name: "output_formatter"},
        })

        const outputparser = new JsonOutputFunctionsParser()
        const chain = prompt.pipe(functionCallingModel).pipe(outputparser)

        const response = await chain.invoke({
            inputText: input
        })

        return NextResponse.json({ok: true, message: response, status: 200})

    }
    catch(e: any){
        return NextResponse.json({error: e.message}, { status: 500})
    }
}