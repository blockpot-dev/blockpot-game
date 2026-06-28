import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'

export const Route = createFileRoute('/privacy')({
    component: PrivacyPolicyPage,
})

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
            <div className='text-sm text-secondary-foreground space-y-3'>{children}</div>
        </VStack>
    )
}

function PrivacyPolicyPage() {
    return (
        <div className='@container w-full'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <h1 className='heading-4xl text-foreground'>Privacy Policy</h1>
                        <p className='text-sm text-secondary-foreground'>
                            This policy explains what information Blockpot collects and how it
                            is used. Final wording is being prepared with our MLRO and will be
                            published before launch.
                        </p>

                        <Section title='What we collect'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='How we use it'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Sharing & third parties (Sumsub, Chainalysis, Chainlink)'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Data retention'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Your rights'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Contact'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>
                    </VStack>
                </Container>
            </div>
        </div>
    )
}
