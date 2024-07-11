import Ai_User from "@/components/Ai_User";
import ChatInput from "@/components/chatInput";
import ChatWindow from "@/components/chat_window";

export default function retrival() {
    return (
        <>
        
            <ChatWindow
                retrival={false}
                endpoint="api/structured_output"
            />
        </>
    )
}