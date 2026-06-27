export type WaitingProps = Record<string, never>

export default function Waiting() {
    return <span className='text-foreground heading-5xl uppercase animate-grow-in'>Drawing...</span>
}