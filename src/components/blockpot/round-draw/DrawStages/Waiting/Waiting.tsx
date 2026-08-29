export type WaitingProps = Record<string, never>

export default function Waiting() {
    return <div className='flex flex-col gap-3 items-center text-center animate-grow-in'>
        <span className='text-foreground heading-5xl uppercase'>Preparing the draw…</span>
        <span className='text-secondary-foreground text-sm'>Randomness from Chainlink VRF is being verified</span>
    </div>
}
