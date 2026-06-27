import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@blockpot-dev/block-pot-design-system'
import VStack from '@/components/core/VStack/VStack'

export const Route = createFileRoute('/cookies')({
    component: CookiePolicyPage,
})

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <VStack className='gap-3'>
            <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
            <div className='text-sm text-secondary-foreground space-y-3'>{children}</div>
        </VStack>
    )
}

function CookiePolicyPage() {
    return (
        <div className='@container w-full'>
            <div className='@min-xs:max-w-[820px] mx-auto my-8 px-4'>
                <Container highlight highlightBottomBorderHidden>
                    <VStack className='gap-8'>
                        <h1 className='heading-4xl text-foreground'>Cookie Policy</h1>
                        <p className='text-sm text-secondary-foreground'>
                            This policy describes the cookies Blockpot sets and how to manage
                            them. Final wording is being prepared with our MLRO and will be
                            published before launch.
                        </p>

                        <Section title='What cookies we set'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Strictly necessary'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Functional'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Analytics'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>

                        <Section title='Managing cookies'>
                            <p className='italic text-secondary-foreground'>To be supplied by legal.</p>
                        </Section>
                    </VStack>
                </Container>
            </div>
        </div>
    )
}
