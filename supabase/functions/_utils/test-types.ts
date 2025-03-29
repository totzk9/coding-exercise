export type ReverseStringSuccessResponse = {
    original: string;
    reversed: string;
    length: number;
};

export type GenerateRandomNumberResponse = {
    min: number;
    max: number;
    value: number;
};

export type ErrorResponse = {
    error: string;
    status: number;
    hint?: string;
};