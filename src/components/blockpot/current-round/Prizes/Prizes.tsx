import HStack from '@/components/core/HStack/HStack'
import { cn } from '@/lib/utils'
import { Container } from '@blockpot-dev/blockpot-design-system'
import PrizeRow, { Prize } from './PrizeRow'
import { ChevronRightIcon } from 'lucide-react'
import { usePrizesOverviewDialogOpen } from '@/providers/ModalOpenStateProvider'
import Binding from '@/utilities/binding'
import PrizesOverviewDialog from '../../modals/PrizesOverviewDialog/PrizesOverviewDialog'

export type _PrizesProps = PrizesProps & {
    prizesOverviewDialogOpen: Binding<boolean>
}

export function _Prizes(props: _PrizesProps) {
    const { className, prizes, prizesOverviewDialogOpen } = props

    return <Container className='p-4 pt-2 pb-[7px]' containerClassName={cn('bg-gray-950 rounded-sm', className)}>
        <HStack className='items-center justify-between pt-2 pb-2 px-2'>
            <h2 className='heading-xl leading-[0.8]'>Prizes</h2>
            <button className='cursor-pointer relative' onClick={() => prizesOverviewDialogOpen.update(true)}>
                <HStack className='items-center gap-0 text-gray-300 before:absolute before:-inset-1 before:-ml-2 before:rounded-md before:transition-colors before:duration-300 before:z-[-1] hover:before:bg-gray-800/50'>
                    <span className='text-sm leading-[0.8]'>See all prizes</span>
                    <ChevronRightIcon className='size-6' />
                </HStack>
            </button>
        </HStack>
        {
            prizes.length === 0 && (
                <p className='text-sm text-secondary-foreground px-2 py-4'>Prizes appear once the draw is funded.</p>
            )
        }
        <table className="w-auto border-collapse">
            <tbody>
                {
                    prizes.map((prize, index) => (
                        <PrizeRow
                            key={index}
                            {...prize}
                            ordinal={index + 1}
                            isLast={index === prizes.length - 1}
                        />
                    ))
                }
            </tbody>
        </table>
        <PrizesOverviewDialog
            open={prizesOverviewDialogOpen.value}
            onClose={() => prizesOverviewDialogOpen.update(false)}
        />
    </Container>
}

export type PrizesProps = {
    className?: string
    prizes: Prize[]
}

export default function Prizes(props: PrizesProps) {
    const prizesOverviewDialogOpen = usePrizesOverviewDialogOpen()
    return <_Prizes {...props} prizesOverviewDialogOpen={prizesOverviewDialogOpen} />
}