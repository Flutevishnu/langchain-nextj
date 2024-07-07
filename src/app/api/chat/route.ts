import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";


const messageHistories: Record<string, InMemoryChatMessageHistory> = {};
const models = new ChatOpenAI({ modelName: "gpt-4o" });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system","Your name is Bava, you should act as a teacher and friend, you should teach the user., answer like real human, realhuman dont text in paragraph, , your reply should not mmore than 2-3 lines, be more human,  Without telling the direct answer, make him/her learn what he/she asks." ],
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



function FormatMessage(messages: Message[]): [string, string][] {
  const AllMessages: [string, string][] = [];
  for (const message of messages) {
      AllMessages.push([message.role, message.content]);
  }
  return AllMessages;
}

export async function POST(request: Request) 
{
  // const { readable, writable } = new TransformStream();
  // const writer = writable.getWriter();

  const body = await request.json();
  const messages = body.messages;
  const input: string= body.input;
  console.log(FormatMessage(messages))
  console.log(messages)

    const config = {
      configurable: {
          sessionId: "abc2",
      },
    };

  const response = await withMessageHistory.invoke(
      {
        input: input,
        chat_history: {...messages}
      },
      config
  );
    
    // for await (const chunk of response) {
    //   console.log(chunk.content)
    //   console.log(chunk)

    //   const dataToSend = { response_data: chunk.content, lc_serializable: chunk.lc_serializable, finish_reason: chunk.response_metadata.finish_reason }
    //   const writeData = `data: ${JSON.stringify(dataToSend)}\n\n`;
    //   console.log(writeData)
    //   await writer.write(writeData);
    // }

  // await writer.close();

  // return res.
  // return new StreamingTextResponse(readable);

  return Response.json({message: response.content})
}