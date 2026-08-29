import { ContainerHeading } from '@/components/core/ContainerHeading'
import VStack from '@/components/core/VStack/VStack'
import { EntryAmount } from '@/types/draw/entry'
import { Amounts } from '@/types/draw/tokens'
import Binding from '@/utilities/binding'
import { SegmentedControl, Input } from '@blockpot-dev/blockpot-design-system'
import EntryCost from './EntryCost/EntryCost'

export type EntryOptionsProps = {
    amountPerEntry: Amounts
    selectedEntries: Binding<EntryAmount>
};

export default function EntryOptions(props: EntryOptionsProps) {
    const { selectedEntries, amountPerEntry } = props
    const entryOptions = [1, 2, 5, 10].map(amount => ({ label: amount.toString(), value: amount.toString() }))

    function handleManualEntryAmountChange(amount: string) {
        if (amount === '') {
            selectedEntries.update({ type: 'custom', amount: 0, stringValue: '' })
            return
        }
        const parsedAmount = parseInt(amount)
        if (parsedAmount > 0) {
            selectedEntries.update({ type: 'custom', amount: parsedAmount, stringValue: amount })
        }
    }

    const inputValue = selectedEntries.value.type === 'custom'
        ? selectedEntries.value.stringValue
        : selectedEntries.value.amount.toString()

    return (
        <div className='w-full font-body'>
            <VStack className='gap-4'>
                <ContainerHeading
                    trailing={<EntryCost entryCost={amountPerEntry} />}
                >
                    ENTER
                </ContainerHeading>
                <Input aria-label='Number of entries' placeholder='0' value={inputValue} onChange={(e) => handleManualEntryAmountChange(e.target.value)} />
                <SegmentedControl
                    onSelect={(value) => {
                        selectedEntries.update({ type: 'fixed', amount: parseInt(value) })
                    }}
                    options={entryOptions}
                    selectedOption={selectedEntries.value.amount.toString()}
                />
            </VStack>
        </div>
    )
}
