/**
 * Represents information about warid's activities and news to be shared for the upcoming events
 */
export interface News {
    id: string;
    publicationDate: Date;
    image: string
    description: string
    author?: string;
}