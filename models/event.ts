/**
 * Represents all the Warid's events
 */
 export interface Event {
    id: string;
    startDate: Date;
    endDate: Date;
    location: string;
    name?: string;
}