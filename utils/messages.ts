export interface Message {
    time: number,
    text: string,
    author: string,
    color: string | undefined,
};

const messages: Message[] = []

export default function addMessage(msg: Message) {
    messages.push(msg);
}