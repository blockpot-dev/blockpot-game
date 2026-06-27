import VStack from '@/components/core/VStack/VStack'

type Resource = {
    name: string
    href: string
    region: string
    description: string
}

const RESOURCES: Resource[] = [
    {
        name: 'BeGambleAware',
        href: 'https://www.begambleaware.org/',
        region: 'UK / Isle of Man',
        description: 'Free, confidential support and treatment options.',
    },
    {
        name: 'Gamblers Anonymous',
        href: 'https://www.gamblersanonymous.org/',
        region: 'International',
        description: 'Peer fellowship for people recovering from problem gambling.',
    },
    {
        name: 'Spillemyndigheden — StopSpillet',
        href: 'https://www.stopspillet.dk/',
        region: 'Denmark',
        description: 'Danish helpline operated by the gambling authority.',
    },
    {
        name: 'Gordon Moody',
        href: 'https://www.gordonmoody.org.uk/',
        region: 'UK',
        description: 'Residential and online treatment for severe gambling addiction.',
    },
    {
        name: 'Jogo Remoto / SICAD',
        href: 'https://www.jogoremoto.pt/pt/jogo-responsavel/',
        region: 'Portugal',
        description: 'Portuguese self-help and clinical referral resources.',
    },
]

const SUPPORT_EMAIL = 'support@blockpot.com'

export type ProblemGamblingResourcesProps = {
    className?: string
}

export default function ProblemGamblingResources({ className }: ProblemGamblingResourcesProps) {
    return (
        <VStack className={`gap-3 ${className ?? ''}`.trim()}>
            <div>
                <h2 className='text-xl font-semibold text-foreground'>Problem-gambling resources</h2>
                <p className='text-sm text-secondary-foreground mt-1'>
                    If you or someone you know needs help, these organisations offer confidential support.
                </p>
            </div>
            <ul className='flex flex-col gap-2'>
                {RESOURCES.map((r) => (
                    <li
                        key={r.href}
                        className='rounded-md border border-border bg-background/40 px-3 py-2'
                    >
                        <a
                            href={r.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-foreground underline hover:text-foreground/80'
                        >
                            {r.name}
                        </a>
                        <span className='text-xs text-secondary-foreground'> · {r.region}</span>
                        <p className='text-xs text-secondary-foreground mt-1 font-body'>{r.description}</p>
                    </li>
                ))}
                <li className='rounded-md border border-border bg-background/40 px-3 py-2'>
                    <a
                        href={`mailto:${SUPPORT_EMAIL}?subject=Responsible%20gaming%20support`}
                        className='text-sm text-foreground underline hover:text-foreground/80'
                    >
                        Contact Blockpot support
                    </a>
                    <p className='text-xs text-secondary-foreground mt-1 font-body'>
                        Email {SUPPORT_EMAIL} for help with your account, deposit limits, or self-exclusion.
                    </p>
                </li>
            </ul>
        </VStack>
    )
}
