"use client"
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { msgAtom } from "./atom";

export default function Ai_User() {
    const [messages, setMessages] = useAtom(msgAtom);

    return (
        <>
            {
                messages.map((msg: any, idx : any) => (
                    <div
                    className={cn(
                    "p-4 mb-2 rounded-lg w-full flex",
                    msg.role === "assistant" ? "justify-start" : "justify-end "
                    )}
                    key={idx}
                    >
                            <div className={cn(
                                "w-fit max-w-96 p-2 px-4",
                                msg.role === "assistant" ? "" : "border rounded-[25px] bg-gray-700"
                            )}>
                                {msg.content}
                            </div>
                            
                        </div>
                    ))
                    }
        </>
    );
    
}