import '../src/styles/tailwind.css'
import './styles.css'
import '../node_modules/@blockpot-dev/block-pot-design-system/dist/styles/styles.css'

import React from 'react'
import { Preview } from '@storybook/react'

// This is a workaround to fix the issue with BigInts in Storybook, we don't care about configuring them though
// @ts-expect-error - extending BigInt.prototype
BigInt.prototype.toJSON = function () {
    return this.toString()
}

function ColorSchemeWrapper({ children }: { children: React.ReactNode }) {
    return <div className={'dark h-full w-full'}>
        <div className='themedRoot bg-background h-full w-full p-4'>
            {children}
        </div>
    </div>
}

const preview: Preview = {
    decorators: [
        (Story) => (
            <ColorSchemeWrapper>
                <Story/>
            </ColorSchemeWrapper>
        )
    ],
    parameters: {
        layout: 'fullscreen'
    }
}

export default preview
