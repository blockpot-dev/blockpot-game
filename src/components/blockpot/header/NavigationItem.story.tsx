import { Meta, StoryObj } from '@storybook/react'
import { useEffect, useRef } from 'react'
import { createMemoryHistory } from '@tanstack/history'
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import NavigationItem, { NavigationItemProps } from './NavigationItem'

type StoryHostProps = Omit<NavigationItemProps, 'target'> & {
    initialPath?: string
    target?: string
    autoFocus?: boolean
}

function NavigationItemHost({ children, isSelected, target = '/play', initialPath = '/', autoFocus = false }: StoryHostProps) {
    const ItemComponent = () => {
        const wrapperRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            if (!autoFocus) return
            const anchor = wrapperRef.current?.querySelector('a')
            anchor?.focus()
        }, [])

        return (
            <div ref={wrapperRef} className='bg-[var(--color-header-surface)] p-6 inline-flex'>
                <NavigationItem target={target} isSelected={isSelected}>{children}</NavigationItem>
            </div>
        )
    }

    const rootRoute = createRootRoute({ component: ItemComponent })
    const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => null })
    const playRoute = createRoute({ getParentRoute: () => rootRoute, path: '/play', component: () => null })
    const transparencyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/transparency', component: () => null })
    const howToPlayRoute = createRoute({ getParentRoute: () => rootRoute, path: '/how-to-play', component: () => null })

    const routeTree = rootRoute.addChildren([indexRoute, playRoute, transparencyRoute, howToPlayRoute])
    const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [initialPath] }) })

    return <RouterProvider router={router} />
}

const meta: Meta<typeof NavigationItemHost> = {
    component: NavigationItemHost,
    args: {
        children: 'Play',
        target: '/play',
    },
}

export default meta

type Story = StoryObj<typeof NavigationItemHost>

export const Default: Story = {
    args: { isSelected: false },
}

export const Selected: Story = {
    args: { isSelected: true },
}

export const Hover: Story = {
    args: { isSelected: false },
    parameters: {
        docs: {
            description: {
                story: 'Hover the label in the canvas to watch the brand-orange underline scale in from the center over 200ms. Storybook has no pseudo-states addon configured for this project, so hover must be exercised manually.',
            },
        },
    },
}

export const Focused: Story = {
    args: { isSelected: false, autoFocus: true },
    parameters: {
        docs: {
            description: {
                story: 'Mounted with the link auto-focused via useEffect; the brand-orange focus-visible ring should be visible immediately. Click anywhere outside and Tab back to re-trigger.',
            },
        },
    },
}
