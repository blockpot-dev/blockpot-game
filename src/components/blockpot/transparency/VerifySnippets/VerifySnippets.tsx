import { useMemo, useState } from 'react'
import { CodeBlock } from '@blockpot-dev/blockpot-design-system'
import VStack from '@/components/core/VStack/VStack'
import { buildSnippets, SnippetId, SnippetInputs } from './snippets'

export type VerifySnippetsProps = {
    inputs: SnippetInputs
    /** Initially selected tab. Defaults to JavaScript. */
    initialTab?: SnippetId
}

export default function VerifySnippets(props: VerifySnippetsProps) {
    const { inputs, initialTab = 'js' } = props
    const snippets = useMemo(() => buildSnippets(inputs), [inputs])
    const [selected, setSelected] = useState<SnippetId>(initialTab)
    const active = snippets.find((s) => s.id === selected) ?? snippets[0]

    return (
        <VStack className='gap-2' data-testid='verify-snippets'>
            <div role='tablist' aria-label='Verification language' className='flex flex-wrap gap-1'>
                {snippets.map((s) => {
                    const isActive = s.id === active.id
                    return (
                        <button
                            key={s.id}
                            type='button'
                            role='tab'
                            id={`verify-tab-${s.id}`}
                            aria-selected={isActive}
                            aria-controls={`verify-panel-${s.id}`}
                            onClick={() => setSelected(s.id)}
                            className={`rounded-sm px-3 py-1 text-xs transition-colors ${
                                isActive
                                    ? 'bg-white/10 text-foreground'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            }`}
                        >
                            {s.label}
                        </button>
                    )
                })}
            </div>
            <div role='tabpanel' id={`verify-panel-${active.id}`} aria-labelledby={`verify-tab-${active.id}`}>
                <CodeBlock
                    code={active.code}
                    language={active.language}
                    title={active.title}
                    actions={active.actions}
                    className='max-h-96 overflow-y-auto'
                />
            </div>
        </VStack>
    )
}
