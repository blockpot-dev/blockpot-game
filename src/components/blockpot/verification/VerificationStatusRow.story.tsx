import { Meta, StoryObj } from '@storybook/react'
import VerificationStatusRow from './VerificationStatusRow'

// Surface 4: the settings row that appears only after first contact.
//
// There is deliberately no "before first contact" story: that state renders
// nothing, and an empty Storybook frame communicates less than the test that
// asserts document.body is empty. Absence is the behaviour, and the test is
// where it is pinned.
//
// The row must not read as a status badge. It says a check was started and
// offers to continue it — never "verified", never "unverified", never a level.

const meta: Meta<typeof VerificationStatusRow> = {
    component: VerificationStatusRow,
    parameters: { layout: 'centered' },
    args: { onVerify: () => {} },
}
export default meta

type Story = StoryObj<typeof VerificationStatusRow>

export const AfterFirstContact: Story = {}

export const Narrow: Story = {
    decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
}
