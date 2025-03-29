export type ReverseStringSuccessResponse = {
    original: string;
    reversed: string;
    length: number;
};

export type ErrorResponse = {
    error: string;
    status: number;
    hint?: string;
};