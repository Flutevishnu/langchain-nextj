"use client"
 
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAtom, useSetAtom } from "jotai";
import { msgAtom } from "@/components/atom"
import { readStreamableValue } from 'ai/rsc';
import { Textarea } from "@/components/ui/textarea"
import { HiOutlineArrowUp } from "react-icons/hi";
import { IoMdSend } from "react-icons/io";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
  } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { FaLink } from "react-icons/fa";
export default function ChatInput(props: {
    retrival: boolean, 
    endpoint: string
}) {

    const [input, SetInput] = useState("")
    const [MessageAtom, setMessageAtom] = useAtom(msgAtom)
    const [Link, setLink] = useState("")
    const [file, setFile] = useState<File>();
    // const [Retrival, setRetrival] = useState(false)
    const { toast } = useToast()

    const formData = new FormData()
    const SendHandle = async() => {

        if (!input.trim()) return;
        const temp = input
        setMessageAtom((prevState) => [
            ...prevState,
            {
                role: "user",
                content: temp
            }
        ])

        SetInput("")

        const res = await fetch(props.endpoint,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                   {
                    messages: [
                        ...MessageAtom,
                        {
                            role: "user",
                            content: temp
                        }
                    ],
                    input: temp
                   }
                )
            }
        ).then(res => res.json())

        console.log(res)
        const data = await res;

        console.log("data" ,   data.message)
        setMessageAtom((prevState) => [
            ...prevState,
            {
                role: "assistant",
                content: data.message,
            }
        ])                                                                                  
        
    }

    const SendLink = async() => {
        if(!Link.trim()) return;

        const response = await fetch("api/retrival",
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(
                    {
                        link:Link || ''
                    }
                )
            }
        ).then(res => res.json())

        const dt = await response;
        console.log("Response", dt)
        
        if(dt.ok){
            
            setLink("")
            toast({
                description: "Vector Store has Completed successfully"
            })
        }
    }

    const sendFile = async () => {
        if (!file) {
            console.log("NO file") 
            return
        }
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
          const response = await fetch("api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
    
          if (data.ok) {
            setFile(undefined);
            toast({
              description: "File uploaded successfully",
            });
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
    };

    

    console.log(props.retrival)

    const handleKeyDown =   (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        console.log('Key pressed:', event.key);
        if (event.key === "Enter") {
            event.preventDefault();
            console.log('Enter key pressed, calling sendHandle'); 
            SendHandle();
        }
    }

    useEffect(() => {
        if (file) {
            toast({
                description: "sendData function called",
            });
            sendFile();
        }
    }, [file]);

    return (
        <div className="flex p-4 space-x-2 w-11/12 lg:w-full max-w-4xl max-h-16 border rounded-[22px] items-center mb-4">

            
            {
                props.retrival===true ? <div className="flex items-center">
                    <Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="py-6"><FaLink /></DropdownMenuTrigger>
                                        <DropdownMenuContent > 
                                        <DropdownMenuLabel>Options(RAG)</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DialogTrigger>
                                            <DropdownMenuItem >
                                                Link
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        </DropdownMenuContent>    
                        </DropdownMenu>
                        <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>Paste the link</DialogTitle>
                        <DialogDescription>
                            Paste the Document link for RAG conversation
                        </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Input
                            id="link"
                            value={Link}
                            onChange={(e) => setLink(e.target.value)}
                            
                            />
                        </div>
                        </div>
                        <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={SendLink}>
                            Confirm
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={sendFile}>
                            Upload File
                            </Button>
                        </DialogClose>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Input
                        type="file"
                        accept="application/pdf"
                        id="fileupload"
                        className="hidden"
                        onChange={(e) => {
                            const uploadedFile = e.target.files?.[0];
                            setFile(uploadedFile);
                            console.log("File selected:", uploadedFile);
                        }}                                
                    />
                    <Label className="pl-2" htmlFor="fileupload"><HiOutlineArrowUp/></Label>
                    
                </div> : null
            } 
            <Textarea
                className="no-scrollbar  flex-grow resize-none border-none min-h-[6px] max-h-10 px-3  focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 "
                placeholder="Write your message here ..."
                value={input}
                onChange={(e) => SetInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button
                className="rounded-[22px]hover:border-white hover:border-2"
                variant={"outline"}
                type="submit"
                onClick={SendHandle}
                onKeyUp={(e) => {
                    if(e.key === 'Enter'){
                        SendHandle
                    }
                }}
            >
                <IoMdSend />
            </Button>
        </div>
    );
    
}