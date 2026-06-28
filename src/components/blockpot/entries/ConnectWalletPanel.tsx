import { useWalletOptionsDialogOpen } from '@/providers/ModalOpenStateProvider'
import { Button, Container } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'

export default function ConnectWalletPanel() {
    const walletOptionsDialogOpen = useWalletOptionsDialogOpen()

    return (
        <Container containerClassName='w-[300px]' className='p-6 h-full'>
            <VStack className='gap-5 items-center justify-center h-full'>
                <img src='/assets/pngs/exclamation-badge.png' alt='' className='size-20' />
                
                <VStack className='gap-4 items-center text-center'>
                    <h2 className='heading-2xl uppercase leading-[0.8]'>
                        Connect Your Wallet
                    </h2>
                    <p className='text-secondary-foreground text-sm'>
                        Connect your wallet to participate in the Blockpot lottery.
                    </p>
                </VStack>

                <Button 
                    onClick={() => walletOptionsDialogOpen.update(true)}
                    className='w-full uppercase font-bold mt-1 mb-20'
                >
                    Connect Wallet
                </Button>
            </VStack>
        </Container>
    )
}