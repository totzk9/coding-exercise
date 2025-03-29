export type SuccessResponse<T> = T;

export type ErrorResponse = {
    error: string;
    status: number;
    hint?: string;
};