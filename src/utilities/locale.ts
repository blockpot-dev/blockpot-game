export function getClientLocale() {
    if (typeof Intl !== 'undefined') {
        try {
            return Intl.NumberFormat().resolvedOptions().locale
        } catch (err) {
            console.error('Cannot get locale from Intl')
        }
    }
}