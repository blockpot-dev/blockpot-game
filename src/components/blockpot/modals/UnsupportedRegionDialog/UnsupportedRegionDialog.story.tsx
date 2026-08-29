import type { Meta, StoryObj } from '@storybook/react'
import { _UnsupportedRegionDialog } from './index'

const meta: Meta<typeof _UnsupportedRegionDialog> = {
    component: _UnsupportedRegionDialog,
    args: { countryName: 'Germany', onReload: () => {} },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
