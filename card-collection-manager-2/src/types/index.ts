export type Configuration = {
    dataStorage: string;
    defaultGame: string;
}

/**
 * Simplest type of a set. All set types need to match at least the
 * required fields of this template type.
 */
export type SetTemplate = {
    id: string;
    name: string;
    releaseDate: string;
}

/**
 * Simplest type of an entry. All card types need to match at least the
 * required fields of this template type.
 */
export type EntryTemplate = {
    id?: number;
    name: string;
    language: string;
    amount: number;
    condition: string;
    set: SetTemplate;
    setNo?: string;
    images: string[];
    note: string;
    signed: boolean;
    altered: boolean;
}