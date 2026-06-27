import { delay } from './time/delay'

export default async function retry<T>(fn: () => Promise<T>, maxRetries: number = 5, retryDelay: number = 200): Promise<T> {
    for(let i = 0; i <= maxRetries; i++) {
        try {
            return await fn()
        } catch(error) {
            if(i === maxRetries) {
                throw error
            }
            await delay(retryDelay)
            retryDelay *= 2
        }
    }
    throw false
}