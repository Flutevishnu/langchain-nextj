
import ChatInput from "@/components/chatInput";
import Conversation from "@/app/action"
import Ai_User from "@/components/Ai_User";
import ChatWindow from "@/components/chat_window";

export default async function Chat() {
    
    // const previousmsg = ["akjdawad"]
    // const response = await Conversation({previousmsg});
    
    return (
        <ChatWindow 
            retrival={false}
            endpoint="api/chat"
        />
    );
}
