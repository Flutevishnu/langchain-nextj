"use client"    
import { useEffect, useState } from "react";
import Ai_User from "./Ai_User";
import ChatInput from "./chatInput";

export default function ChatWindow(props :{ 
    retrival: boolean,
    endpoint: string,
 }) {
    const [ file, setFile] = useState<File>();

    return (
        <>
            <div className="flex flex-col h-[100dvh] items-center">
                                            
                                            
                
                <div className="flex-grow w-full max-w-4xl overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 pl-4 ">
                        <Ai_User />
                </div>
                <ChatInput {...props} />
            </div>
        </>
    )
}