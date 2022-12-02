export type Set = {
    id: string;
    name: string;
    releaseDate: string;
}

export type CardEntry = {
    id: number;

    name: string;
    set: Set;
    setNo: string;
    language: string;
    condition: string;
    amount: number;

    note: string;
    images: string[];

    firstEdition: boolean;
    holo: boolean;
    signed: boolean;
    altered: boolean;


}