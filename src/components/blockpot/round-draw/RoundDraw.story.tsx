import type { Meta, StoryObj } from '@storybook/react'
import RoundDraw, { RoundDrawProps } from '.'
import { ZERO_ADDRESS } from '@/web3/constants'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { DrawRound } from '@/types/draw'
import { Container } from '@blockpot-dev/blockpot-design-system'
import { BlockpotDraw } from '@/providers/BlockpotDrawProvider'
import { DisplayDrawnNumberData } from '@/types/draw/display-drawn-number-data'
import { useInterval } from '@/hooks/utilities/useInterval'

const DRAWN_ROUND: DrawRound = {
    roundIndex: 1,
    roundIndexInPot: 1,
    maxRoundsInPot: 10,
    prizePool: 0n,
    draws: [
        {
            number: 483,
            winner: ZERO_ADDRESS,
            prize: 0n
        },
        {
            number: 38938,
            winner: '0x0000000000000000000000000000000000000420',
            prize: 123n
        },
        {
            number: 81724,
            winner: ZERO_ADDRESS,
            prize: 0n
        },
        {
            number: 3128,
            winner: ZERO_ADDRESS,
            prize: 0n
        },
        {
            number: 987312,
            winner: '0x0000000000000000000000000000000000000420',
            prize: 123n
        },
        {
            number: 23480,
            winner: ZERO_ADDRESS,
            prize: 0n
        }
    ],
    entryCount: 91248,
    potIndex: 5,
    drawTime: 1719849600,
    chance: 3200,
    done: true
}

function Template(props: RoundDrawProps) {
    const accountAddress: Address = '0x0000000000000000000000000000000000000420'
    const [draw, setDraw] = useState<BlockpotDraw>({
        drawStage: {
            type: 'waiting',
            roundIndex: 0
        },
        roundIndex: 0
    })
    const { start, stop } = useInterval(() => {
        advanceDrawStage()
    }, 5000)

    function advanceDrawStage() {
        switch (draw.drawStage.type) {
        case 'waiting':
            setDraw({
                drawStage: {
                    type: 'drawing',
                    drawnRound: DRAWN_ROUND,
                    stagedDraw: {
                        drawnNumbers: []
                    },
                    playerEntries: []
                },
                roundIndex: 0
            })
            break
        case 'drawing':
            if (draw.drawStage.stagedDraw.drawnNumbers.length < 3) {
                const drawnNumbers: DisplayDrawnNumberData[] = [...draw.drawStage.stagedDraw.drawnNumbers, {
                    number: Math.floor(Math.random() * 1000000),
                    isPlayerWinner: false,
                    ordinal: 0,
                    prize: {
                        amount: 0n,
                        amountFormatted: '0',
                        fiat: 0n,
                        fiatFormatted: '0',
                        nativeToken: 'ETH'
                    },
                    winner: ZERO_ADDRESS
                }]
                setDraw({
                    drawStage: {
                        type: 'drawing',
                        drawnRound: DRAWN_ROUND,
                        stagedDraw: {
                            drawnNumbers
                        },
                        playerEntries: []
                    },
                    roundIndex: 0
                })
            } else {
                stop()
                setDraw({
                    ...draw,
                    drawStage: {
                        ...draw.drawStage,
                        type: 'complete'
                    }
                })
            }
            break
        case 'complete':
            break
        }
    }

    useEffect(() => {
        if (draw.drawStage.type === 'waiting') {
            start()
        }
        return () => stop()
    }, [draw.drawStage.type, start, stop])

    return (
        <Container containerClassName='w-[700px] min-h-[700px] flex flex-col' className='flex-1 flex flex-col p-0'>
            <RoundDraw
                draw={draw}
                accountAddress={accountAddress}
                roundInfo={{
                    potIndex: 5,
                    currentRound: 3,
                    maximumRounds: 10,
                    winnerChance: 3200,
                    prizePool: 1234n
                }}
            />
        </Container>
    )
}

const meta: Meta<typeof RoundDraw> = {
    component: RoundDraw
}

export default meta

type Story = StoryObj<typeof RoundDraw>
export const Basic: Story = {
    args: {},
    render: (props: RoundDrawProps) => <Template {...props} />
}