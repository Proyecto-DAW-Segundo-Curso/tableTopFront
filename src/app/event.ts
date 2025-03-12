export interface Event {
    id?: number;
    name: string;
    location: string;
    dateTime: string;
    maxPlayers: number;
    creatorId?: string;
    participants?: string[];
}
