import { describe, expect, it } from 'vitest'
import * as viem from 'viem'
import vectors from '@/utilities/draw/__fixtures__/draw-vectors.json'
import { buildSnippets, remixUrl, SnippetInputs, VIEM_ESM_URL } from './snippets'

const base: SnippetInputs = {
    seed: 0x1111111111111111111111111111111111111111111111111111111111112222n,
    maxNumber: 4,
    totalNumbers: 5,
    expected: [2, 0, 4, 3, 1],
    drawAddress: '0x1000000000000000000000000000000000000001',
    randomNumberProviderAddress: '0x2000000000000000000000000000000000000002',
    roundIndex: 7,
    chainId: 31337,
}

function snippet(inputs: SnippetInputs, id: string) {
    const s = buildSnippets(inputs).find((x) => x.id === id)
    if (!s) throw new Error(`no snippet ${id}`)
    return s
}

/** Execute the displayed JS with the local viem standing in for the CDN import. */
async function runJs(code: string): Promise<string[]> {
    const logs: string[] = []
    const local = code.replace(`await import('${VIEM_ESM_URL}')`, 'viem')
    expect(local).not.toContain(VIEM_ESM_URL)
    const fn = new Function('viem', 'console', `return (\n${local}\n)`)
    await fn(viem, { log: (line: string) => logs.push(String(line)) })
    return logs
}

describe('buildSnippets — JavaScript', () => {
    for (const v of vectors.vectors) {
        it(`displayed JS reproduces the on-chain draw for ${v.name}`, async () => {
            const { code } = snippet(
                { ...base, seed: BigInt(v.seed), maxNumber: v.maxNumber, totalNumbers: v.totalNumbers, expected: v.expected },
                'js'
            )
            const logs = await runJs(code)
            expect(logs).toEqual([v.expected.join(', ')])
            expect(code).toContain(`// expected: ${v.expected.join(', ')}`)
        })
    }

    it('imports viem from the ESM CDN and carries the console hint', () => {
        const s = snippet(base, 'js')
        expect(s.code).toContain(`await import('${VIEM_ESM_URL}')`)
        expect(s.title).toMatch(/browser console/i)
        expect(s.actions).toEqual([{ label: 'Open in RunKit', href: 'https://runkit.com/new' }])
    })

    it('does not contain TypeScript syntax', () => {
        const { code } = snippet(base, 'js')
        expect(code).not.toMatch(/: (bigint|number)\b/)
        expect(code).not.toContain('export ')
        expect(code).not.toContain('DrawProofInputs')
        expect(code).not.toContain('Map<')
    })
})

describe('buildSnippets — placeholders', () => {
    const pending: SnippetInputs = { ...base, seed: null, maxNumber: null, totalNumbers: null, expected: null }

    it.each(['js', 'python', 'solidity'])('%s shows 0x… and no expected line', (id) => {
        const { code } = snippet(pending, id)
        expect(code).toContain('0x…')
        expect(code).not.toMatch(/expected:/)
        expect(code).not.toContain('function expected()')
    })

    it('verified rounds carry pre-filled inputs and the expected output', () => {
        expect(snippet(base, 'python').code).toContain('# expected: [2, 0, 4, 3, 1]')
        expect(snippet(base, 'solidity').code).toContain('function expected()')
        expect(snippet(base, 'solidity').code).toContain('out[4] = 1;')
        expect(snippet(base, 'js').code).toContain('seed: 0x1111111111111111111111111111111111111111111111111111111111112222n')
    })
})

describe('buildSnippets — Solidity / Remix', () => {
    it('Remix URL round-trips the code', () => {
        const { code, actions } = snippet(base, 'solidity')
        const remix = actions.find((a) => a.label === 'Open in Remix')!
        expect(remix.href).toBe(remixUrl(code))
        const encoded = new URL(remix.href).hash.match(/#code=([^&]+)/)![1]
        expect(decodeURIComponent(escape(atob(encoded)))).toBe(code)
        expect(actions.map((a) => a.label)).toContain('View contract source')
    })
})

describe('buildSnippets — fetch the seed', () => {
    it('targets the provider with the draw address, round and chain RPC', () => {
        const { code, actions } = snippet(base, 'fetch-seed')
        expect(code).toContain(`cast call ${base.randomNumberProviderAddress}`)
        expect(code).toContain('getRandomNumberGeneratorInputsForGameAndRound(address,uint32)(uint256,uint256,uint48,uint8)')
        expect(code).toContain(`${base.drawAddress} 7 --rpc-url http://127.0.0.1:8545`)
        expect(code).toContain('Local anvil')
        expect(actions).toEqual([])
    })

    it('falls back to a $RPC_URL placeholder on unknown chains', () => {
        expect(snippet({ ...base, chainId: 424242 }, 'fetch-seed').code).toContain('--rpc-url $RPC_URL')
    })
})

// Manual aid: SNIPPET_DUMP=1 bun run test snippets.test.ts prints the Python snippet between markers.
if (process.env.SNIPPET_DUMP) {
    process.stdout.write(`\n<<<PY>>>\n${snippet(base, 'python').code}\n<<<END>>>\n`)
}
