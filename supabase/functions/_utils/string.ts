export function isValidText(input: any): input is string { 
    return typeof input === 'string' && input.trim().length > 0;
}