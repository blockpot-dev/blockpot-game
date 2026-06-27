import { cn } from '@/lib/utils'

const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn('mx-auto w-full @min-xs:max-w-[1348px]', className)}>
            {children}
        </div>
    )
}
  
export default Container