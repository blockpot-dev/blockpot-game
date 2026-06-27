import { createFileRoute } from '@tanstack/react-router'
import VStack from '@/components/core/VStack/VStack'

export const Route = createFileRoute('/terms')({
    component: TermsOfServicePage,
})

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
            <div className='text-sm text-secondary-foreground space-y-3'>{children}</div>
        </VStack>
    )
}

function TermsOfServicePage() {
    return (
        <div className='@container w-full h-full'>
            <div className='@min-xs:max-w-[820px] mx-auto mt-8 mb-auto'>
                <VStack className='gap-8 p-6'>
                    <h1 className='heading-4xl text-foreground'>Terms of Service</h1>
                    <p className='text-sm text-secondary-foreground'>
                        These terms govern your use of Blockpot. Final wording is being
                        prepared with our MLRO and will be published before launch.
                    </p>

                    <Section title='Eligibility'>
                        <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                    </Section>

                    <Section title='Account & wallet'>
                        <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                    </Section>

                    <Section title='Tickets, draws, and payouts'>
                        <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                    </Section>

                    <Section title='Responsible play'>
                        <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                    </Section>

                    <Section title='Liability'>
                        <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                    </Section>

                    <Section title='Changes to these terms'>
                        <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                    </Section>

                    <Section title='Contact'>
                        <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                    </Section>
                </VStack>
            </div>
        </div>
    )
}
