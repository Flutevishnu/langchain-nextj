import Ai_User from "@/components/Ai_User";
import ChatInput from "@/components/chatInput";
import ChatWindow from "@/components/chat_window";

export default function retrival() {
    return (
        <>
        
            <ChatWindow
                retrival={true}
                endpoint="api/retrival_agent"
            />
        </>
    )
}