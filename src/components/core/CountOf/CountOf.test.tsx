import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CountOf from './CountOf'

describe('<CountOf>', () => {
    it('renders the numbers with a de-emphasised body-font connector', () => {
        render(<CountOf value='3' total='10' />)
        expect(screen.getByTestId('count-of')).toHaveTextContent('3 of 10')
        const of = screen.getByText('of')
        expect(of.className).toContain('font-body')
        expect(of.className).toContain('text-[0.5em]')
    })

    it('renders an optional suffix in the same style', () => {
        render(<CountOf value='2' total='5' suffix='drawn' />)
        expect(screen.getByTestId('count-of')).toHaveTextContent('2 of 5 drawn')
        expect(screen.getByText('drawn').className).toContain('font-body')
    })
})
