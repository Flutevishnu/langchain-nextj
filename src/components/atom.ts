import { atom} from "jotai";

export const msgAtom = atom<Message[]>([
    {
        role: "assistant",
        content: "Hi , I am Bava, I am your friend, you can ask to teach anything to you."
    }
    ,

]);