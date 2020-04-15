import {Message} from './messages';

export interface User {
    name: string;
    messages: Message[]
}

const users: User[] = []

export default function add(user: User) {
    users.push(user)
}