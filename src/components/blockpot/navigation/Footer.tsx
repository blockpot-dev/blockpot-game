import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Address } from 'viem'
import VStack from '@/components/core/VStack/VStack'
import HStack from '@/components/core/HStack/HStack'
import { SOCIAL_MEDIA } from '@/constants/social-media'
import useTestEthFaucet from '@/hooks/dev/useTestEthFaucet'
import useSiweSignature from '@/hooks/contracts/player-registry/useSiweSignature'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { usePlayerSession } from '@/providers/PlayerSessionProvider'
import { ZERO_ADDRESS } from '@/web3/constants'

const COPYRIGHT_YEAR = new Date().getFullYear()

const PRIMARY_LINK_CLASSES = 'text-sm text-secondary-foreground hover:text-foreground transition-colors'
const LEGAL_LINK_CLASSES = 'text-xs text-secondary-foreground hover:text-foreground transition-colors'

const TESTNET_FAUCET_ENABLED = import.meta.env.VITE_ENABLE_TESTNET_FAUCET === 'true'
const FAUCET_TOAST_ID = 'testnet-faucet-request'

function shortHash(hash: string): string {
    return hash.length > 12 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash
}

export default function Footer() {
    const faucet = useTestEthFaucet()
    const siwe = useSiweSignature()
    const { session } = usePlayerSession()
    const address = useAccountAddress()

    const sendFaucetRequest = () => {
        toast.loading('Requesting test ETH…', { id: FAUCET_TOAST_ID })
        faucet.mutate(undefined, {
            onSuccess: (data) => {
                toast.success('Test ETH sent', {
                    id: FAUCET_TOAST_ID,
                    description: `1 ETH on the way · tx ${shortHash(data.txHash)}`,
                })
            },
            onError: (error) => {
                toast.error('Could not send test ETH', {
                    id: FAUCET_TOAST_ID,
                    description: error instanceof Error ? error.message : 'Please try again.',
                })
            },
        })
    }

    const requestTestEth = () => {
        if (faucet.isPending || siwe.isPending) return
        if (address === ZERO_ADDRESS) {
            toast.error('Connect a wallet first', {
                id: FAUCET_TOAST_ID,
                description: 'Open the wallet menu in the header, then try again.',
            })
            return
        }
        if (session) {
            sendFaucetRequest()
            return
        }
        toast.loading('Sign in to request test ETH', {
            id: FAUCET_TOAST_ID,
            description: 'Approve the signature in your wallet…',
        })
        siwe.mutate(
            { address: address as Address },
            {
                onSuccess: () => sendFaucetRequest(),
                onError: (error) => {
                    toast.error('Could not sign in', {
                        id: FAUCET_TOAST_ID,
                        description: error instanceof Error ? error.message : 'Signature rejected.',
                    })
                },
            },
        )
    }

    return (
        <footer className='w-full mt-auto bg-background border-t border-border'>
            <div className='@min-xs:max-w-[1348px] mx-auto py-12 px-6'>
                <VStack className='gap-6 items-center'>
                    <img
                        src='/assets/svgs/logo-with-text.svg'
                        alt='Blockpot Logo'
                        className='w-[160px] h-10'
                    />
                    <HStack className='gap-3 items-center'>
                        <Link to='/how-to-play' className={PRIMARY_LINK_CLASSES}>
                            How to play
                        </Link>
                        <span className='text-secondary-foreground'>·</span>
                        <Link to='/transparency' className={PRIMARY_LINK_CLASSES}>
                            Transparency
                        </Link>
                        <span className='text-secondary-foreground'>·</span>
                        <Link to='/responsible-gaming' className={PRIMARY_LINK_CLASSES}>
                            Responsible gaming
                        </Link>
                    </HStack>
                </VStack>

                <div className='border-t border-border my-6' />

                <HStack className='flex-col gap-4 items-center @min-md:flex-row @min-md:justify-between @min-md:items-center'>
                    <HStack className='gap-6 items-center'>
                        <HStack className='gap-2 items-center'>
                            <span className='text-xs text-secondary-foreground'>Powered by</span>
                            <img
                                src='/chainlink-logo.svg'
                                alt='Chainlink'
                                className='w-[86px] h-[26px]'
                            />
                        </HStack>
                        <HStack className='gap-4 items-center'>
                            {SOCIAL_MEDIA.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='cursor-pointer hover:opacity-80 hover:scale-95 transition-all'
                                >
                                    <img src={social.src} alt={social.name} width={20} height={20} />
                                </a>
                            ))}
                        </HStack>
                    </HStack>

                    <HStack className='gap-3 items-center flex-wrap justify-center'>
                        <span className='text-xs text-secondary-foreground'>
                            © {COPYRIGHT_YEAR} Blockpot
                        </span>
                        <span className='text-secondary-foreground'>·</span>
                        <Link to='/terms' className={LEGAL_LINK_CLASSES}>
                            Terms
                        </Link>
                        <span className='text-secondary-foreground'>·</span>
                        <Link to='/privacy' className={LEGAL_LINK_CLASSES}>
                            Privacy
                        </Link>
                        <span className='text-secondary-foreground'>·</span>
                        <Link to='/cookies' className={LEGAL_LINK_CLASSES}>
                            Cookies
                        </Link>
                        {TESTNET_FAUCET_ENABLED && (
                            <>
                                <span className='text-secondary-foreground'>·</span>
                                <button
                                    type='button'
                                    onClick={requestTestEth}
                                    disabled={faucet.isPending || siwe.isPending}
                                    className={`${LEGAL_LINK_CLASSES} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0 p-0`}
                                >
                                    Get test ETH
                                </button>
                            </>
                        )}
                    </HStack>
                </HStack>
            </div>
        </footer>
    )
}
