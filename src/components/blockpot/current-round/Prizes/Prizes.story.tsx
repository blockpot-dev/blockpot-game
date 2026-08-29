import { Meta, StoryObj } from '@storybook/react'
import { _Prizes } from './Prizes'

const noopBinding = { value: false, update: () => {} }

const meta: Meta<typeof _Prizes> = {
    component: _Prizes,
    args: { className: 'w-[252px]', prizesOverviewDialogOpen: noopBinding },
}

export default meta

type Story = StoryObj<typeof _Prizes>

export const Funded: Story = {
    args: {
        prizes: [
            { nativeToken: 'eth', tokenAmountFormatted: '10', fiatFormatted: '$25,000' },
            { nativeToken: 'eth', tokenAmountFormatted: '2', fiatFormatted: '$5,000' },
            { nativeToken: 'eth', tokenAmountFormatted: '0.5', fiatFormatted: '$1,250' },
        ],
    },
}

/** No pots yet — the panel says why rather than rendering an empty table. */
export const Empty: Story = {
    args: { prizes: [] },
}
