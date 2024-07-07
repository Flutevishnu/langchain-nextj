"use server"

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};
const models = new ChatOpenAI({ modelName: "gpt-4" });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system","Your name is Bava, you should act as a teacher and friend, you should teach the user. Without telling the direct answer, make him/her learn what he/she asks." ],
        ["placeholder", "{chat_history}" ],
        ["user","{input}" ]
    ]);

    const chain = prompt.pipe(models);

const withMessageHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async (sessionId) => {
        if (!messageHistories[sessionId]) {
            messageHistories[sessionId] = new InMemoryChatMessageHistory();
        }
        return messageHistories[sessionId];
    },
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history"
});

export default async function Conversation({previousmsg}: {
    previousmsg: string[]
}) {
    
    const config = {
        configurable: {
            sessionId: "abc2",
        },
    };
    
    
    const response = await withMessageHistory.invoke(
        {
            input: "what is my name",
        },
        config
    );
    

    return String(response.content);
}
