"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Link from 'next/link';
import { cn } from "@/lib/utils";
    
export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const data = ["Chat", "StructuredOutput", "Agents", "retrieval", "RetrievalAgents"];
    return (
        <aside className="h-[100dvh] z-40">
            <div className="w-full h-full flex mr-0">
                <div className={cn("transition-all duration-300 z-40 fixed lg:static h-[100dvh]", {
                    "-translate-x-72 max-w-0": !sidebarOpen,
                    "translate-x-0 bg-slate-300 dark:bg-slate-800 max-w-52": sidebarOpen,
                })}>
                    <div className="px-2 mt-4">
                        <Button 
                                variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1.5rem"
                                height="1.5rem"
                                viewBox="0 0 24 24"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <path
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M2 12c0-3.69 0-5.534.814-6.841a4.8 4.8 0 0 1 1.105-1.243C5.08 3 6.72 3 10 3h4c3.28 0 4.919 0 6.081.916c.43.338.804.759 1.105 1.243C22 6.466 22 8.31 22 12s0 5.534-.814 6.841a4.8 4.8 0 0 1-1.105 1.243C18.92 21 17.28 21 14 21h-4c-3.28 0-4.919 0-6.081-.916a4.8 4.8 0 0 1-1.105-1.243C2 17.534 2 15.69 2 12m7.5-9v18M5 7h1m-1 3h1"
                                    color="currentColor"
                                ></path>
                            </svg>
                        </Button>
                    </div>
                    
                    <div className="px-2 mt-10">
                        {data.map((item, index) => (
                            <Link key={index} href={"/" + item.replace(" ", "")}>
                                <p className="py-2 px-2 hover:bg-slate-700 rounded-lg">{item}</p>
                            </Link>
                        ))}
                    </div>
                </div>
                
                <div className="pl-2 pt-4 z-50 ml-0 flex absolute h-full">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.5rem"
                            height="1.5rem"
                            viewBox="0 0 24 24"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M2 12c0-3.69 0-5.534.814-6.841a4.8 4.8 0 0 1 1.105-1.243C5.08 3 6.72 3 10 3h4c3.28 0 4.919 0 6.081.916c.43.338.804.759 1.105 1.243C22 6.466 22 8.31 22 12s0 5.534-.814 6.841a4.8 4.8 0 0 1-1.105 1.243C18.92 21 17.28 21 14 21h-4c-3.28 0-4.919 0-6.081-.916a4.8 4.8 0 0 1-1.105-1.243C2 17.534 2 15.69 2 12m7.5-9v18M5 7h1m-1 3h1"
                                color="currentColor"
                            ></path>
                        </svg>
                    </Button>
                </div>
            </div>
        </aside>
    );
}
