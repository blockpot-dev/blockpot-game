import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DrawFairnessSectionPure, DrawFairnessSectionPureProps } from './DrawFairnessSection'
import { GameType } from '@/providers/SelectedGameProvider'

// The proof panel is a children slot (it needs chain hooks); stub it so the controls can be exercised alone.
function Stateful(props: DrawFairnessSectionPureProps) {
    const [game, setGame] = useState<GameType>(props.game)
    const [round, setRound] = useState(props.roundIndex)
    const latest = game === 'main' ? props.latestRoundIndex : Math.max(1, Math.floor(props.latestRoundIndex / 3))
    return (
        <DrawFairnessSectionPure
            game={game}
            onGameChange={(g) => { setGame(g); setRound(Math.max((g === 'main' ? props.latestRoundIndex : Math.max(1, Math.floor(props.latestRoundIndex / 3))) - 1, 0)) }}
            roundIndex={Math.min(round, latest)}
            latestRoundIndex={latest}
            onRoundChange={setRound}
        >
            <div className='rounded-lg border border-border p-6 text-sm text-secondary-foreground font-mono'>
                proof panel for {game} round {Math.min(round, latest)}
            </div>
        </DrawFairnessSectionPure>
    )
}

const meta: Meta<typeof DrawFairnessSectionPure> = {
    component: DrawFairnessSectionPure,
    render: (args) => <Stateful {...args} />,
    decorators: [
        (Story) => (
            <div style={{ width: 900 }}>
                <Story />
            </div>
        ),
    ],
    args: { onGameChange: () => undefined, onRoundChange: () => undefined, children: null },
}
export default meta
type Story = StoryObj<typeof DrawFairnessSectionPure>

export const MainGame: Story = { args: { game: 'main', roundIndex: 41, latestRoundIndex: 42 } }
export const QuickGame: Story = { args: { game: 'quick', roundIndex: 13, latestRoundIndex: 14 } }
export const FirstRound: Story = { args: { game: 'main', roundIndex: 0, latestRoundIndex: 42 } }
export const AtLatest: Story = { args: { game: 'main', roundIndex: 42, latestRoundIndex: 42 } }
export const SingleRound: Story = { args: { game: 'main', roundIndex: 0, latestRoundIndex: 0 } }
