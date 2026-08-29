import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Countdown from './Countdown'

describe('<Countdown>', () => {
    it('renders the waiting copy once the draw time has passed', () => {
        render(<Countdown timeBetweenRounds={60} nextDrawTime={Math.floor(Date.now() / 1000) - 10} />)
        expect(screen.getByText('Draw starting soon…')).toBeInTheDocument()
    })
})
