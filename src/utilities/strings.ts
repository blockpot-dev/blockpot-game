export function filterNonNumeric(input: string) {
    return input.replace(/\D/g, '')
}