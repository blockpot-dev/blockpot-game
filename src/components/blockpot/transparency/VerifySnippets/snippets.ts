import { Address } from 'viem'
import type { CodeBlockAction } from '@blockpot-dev/blockpot-design-system'
import jsSource from '@/utilities/draw/reproduceDrawnNumbers.ts?raw'
import { CHAIN_DISPLAY_NAME, PUBLIC_RPC_URL } from '@/constants/network-details'

export interface SnippetInputs {
    /** null => placeholder "0x…" (round pending / unavailable) */
    seed: bigint | null
    maxNumber: number | null
    totalNumbers: number | null
    /** On-chain numbers; null when status is pending/unavailable */
    expected: readonly number[] | null
    drawAddress: Address
    randomNumberProviderAddress: Address
    roundIndex: number
    chainId: number
}

export type SnippetId = 'js' | 'python' | 'solidity' | 'fetch-seed'

export interface Snippet {
    id: SnippetId
    label: string
    /** Display-only language tag for the CodeBlock header */
    language: string
    title: string
    code: string
    actions: CodeBlockAction[]
}

export const VIEM_ESM_URL = 'https://esm.sh/viem'
export const CANONICAL_SOLIDITY_URL =
    'https://github.com/blockpot-dev/unipot-contracts/blob/main/src/DrawRandomNumberProvider.sol'
export const RUNKIT_URL = 'https://runkit.com/new'
export const REPLIT_PYTHON_URL = 'https://replit.com/languages/python3'
export const COLAB_URL = 'https://colab.research.google.com/#create=true'
const REMIX_BASE = 'https://remix.ethereum.org/'
const REMIX_QUERY = '&lang=en&optimize=false&runs=200&evmVersion=null&version=soljson-v0.8.26+commit.8a97fa7a.js'

const SEED_PLACEHOLDER = '0x…'

function seedHex(seed: bigint | null): string {
    return seed === null ? SEED_PLACEHOLDER : `0x${seed.toString(16)}`
}

function numOrPlaceholder(n: number | null, placeholder: string): string {
    return n === null ? placeholder : String(n)
}

/**
 * Turn the TypeScript source the browser actually runs into plain JavaScript a reader can paste into
 * a console. This is a deliberately narrow, line-oriented transform of `reproduceDrawnNumbers.ts` —
 * NOT a general TS stripper. `snippets.test.ts` evaluates the output against the Solidity-emitted
 * vectors, so any change to the source that this transform cannot handle fails the build.
 */
export function toPlainJs(source: string): string {
    return (
        source
            // drop the type-only import
            .replace(/^import \{ DrawProofInputs \} from '@\/types\/draw\/drawProof'\n/m, '')
            // viem comes from a CDN at runtime; inside the async IIFE we can `await import`
            .replace(
                /^import \{ encodeAbiParameters, keccak256 \} from 'viem'$/m,
                `const { encodeAbiParameters, keccak256 } = await import('${VIEM_ESM_URL}')`
            )
            // strip `export` — everything lives in one scope
            .replace(/^export /gm, '')
            // generics on Map
            .replace(/new Map<[^>]*>\(\)/g, 'new Map()')
            // parameter / return / const type annotations
            .replace(/: (?:bigint|number|DrawProofInputs)(?:\[\])?(?=[,)=\s])/g, '')
    )
}

function jsSnippet(inputs: SnippetInputs): string {
    const body = toPlainJs(jsSource).trimEnd()
    const seed = inputs.seed === null ? `${SEED_PLACEHOLDER}n // paste the VRF seed shown above` : `${seedHex(inputs.seed)}n`
    const lines = [
        '// Paste into your browser console (F12) or any modern JS runtime.',
        '// This is the exact source blockpot-game runs to recompute the draw.',
        '(async () => {',
        body,
        '',
        `const numbers = reproduceDrawnNumbers({ seed: ${seed}, maxNumber: ${numOrPlaceholder(inputs.maxNumber, '/* maxNumber */ 0')}, totalNumbers: ${numOrPlaceholder(inputs.totalNumbers, '/* numbers drawn */ 0')} })`,
        "console.log(numbers.join(', '))",
    ]
    if (inputs.expected) lines.push(`// expected: ${inputs.expected.join(', ')}`)
    lines.push('})()')
    return lines.join('\n')
}

function pythonSnippet(inputs: SnippetInputs): string {
    const seed = inputs.seed === null ? `int("${SEED_PLACEHOLDER}", 16)  # paste the VRF seed shown above` : seedHex(inputs.seed)
    const lines = [
        '# pip install pycryptodome',
        '# Port of unipot-contracts DrawRandomNumberProvider._drawNumbers / _uniformBelow',
        'from Crypto.Hash import keccak',
        '',
        'MAX_REJECTION_RETRIES = 100',
        '',
        '',
        'def abi_encode(seed: int, i: int, attempt: int) -> bytes:',
        '    # abi.encode(uint256 seed, uint8 i, uint256 attempt): three left-padded 32-byte words',
        "    return seed.to_bytes(32, 'big') + i.to_bytes(32, 'big') + attempt.to_bytes(32, 'big')",
        '',
        '',
        'def keccak256(data: bytes) -> int:',
        "    return int.from_bytes(keccak.new(digest_bits=256, data=data).digest(), 'big')",
        '',
        '',
        'def uniform_below(seed: int, i: int, range_: int) -> int:',
        '    """Uniform integer in [0, range_) with zero modulo bias (bottom-residue rejection)."""',
        '    if range_ == 1:',
        '        return 0',
        '    reject_below = (2**256) % range_',
        '    for attempt in range(MAX_REJECTION_RETRIES):',
        '        word = keccak256(abi_encode(seed, i, attempt))',
        '        if word >= reject_below:',
        '            return word % range_',
        "    raise RuntimeError(f'rejection sampling failed for index {i}')",
        '',
        '',
        'def reproduce(seed: int, max_number: int, total_numbers: int) -> list[int]:',
        '    """Partial Fisher-Yates over the virtual array a[x] == x for x in [0, max_number]."""',
        '    n = max_number + 1',
        '    overrides: dict[int, int] = {}',
        '    numbers = []',
        '    for i in range(total_numbers):',
        '        j = i + uniform_below(seed, i, n - i)',
        '        aj = overrides.get(j, j)',
        '        ai = overrides.get(i, i)',
        '        numbers.append(aj)',
        '        overrides[j] = ai',
        '    return numbers',
        '',
        '',
        `print(reproduce(${seed}, ${numOrPlaceholder(inputs.maxNumber, '0  # max_number')}, ${numOrPlaceholder(inputs.totalNumbers, '0  # numbers drawn')}))`,
    ]
    if (inputs.expected) lines.push(`# expected: [${inputs.expected.join(', ')}]`)
    return lines.join('\n')
}

function soliditySnippet(inputs: SnippetInputs): string {
    const expectedFn = inputs.expected
        ? [
              '',
              '    /// @notice The on-chain draw for this round. verify(...) with the inputs below must equal it.',
              '    function expected() external pure returns (uint48[] memory out) {',
              `        out = new uint48[](${inputs.expected.length});`,
              ...inputs.expected.map((n, idx) => `        out[${idx}] = ${n};`),
              '    }',
          ]
        : []
    const inputsComment = [
        `    // Inputs for this round: seed = ${seedHex(inputs.seed)}, maxNumber = ${numOrPlaceholder(inputs.maxNumber, '?')}, totalNumbers = ${numOrPlaceholder(inputs.totalNumbers, '?')}`,
    ]
    return [
        '// SPDX-License-Identifier: MIT',
        'pragma solidity ^0.8.20;',
        '',
        `// Standalone port of ${CANONICAL_SOLIDITY_URL}`,
        '// (_drawNumbers + _uniformBelow). Deploy in Remix and call verify(seed, maxNumber, totalNumbers).',
        'contract VerifyDraw {',
        '    uint256 private constant MAX_REJECTION_RETRIES = 100;',
        '',
        ...inputsComment,
        '    function verify(uint256 seed, uint48 maxNumber, uint8 totalNumbers) external pure returns (uint48[] memory numbers) {',
        '        uint256 n = uint256(maxNumber) + 1;',
        '        numbers = new uint48[](totalNumbers);',
        '        uint48[] memory swapPos = new uint48[](totalNumbers);',
        '        uint48[] memory swapVal = new uint48[](totalNumbers);',
        '        uint8 swapLen = 0;',
        '        for (uint8 i = 0; i < totalNumbers; ++i) {',
        '            uint48 j = uint48(i) + uniformBelow(seed, i, n - i);',
        '            uint48 aj = readVirtual(swapPos, swapVal, swapLen, j);',
        '            uint48 ai = readVirtual(swapPos, swapVal, swapLen, uint48(i));',
        '            numbers[i] = aj;',
        '            swapLen = writeVirtual(swapPos, swapVal, swapLen, j, ai);',
        '        }',
        '    }',
        '',
        '    function uniformBelow(uint256 seed, uint8 i, uint256 range) internal pure returns (uint48) {',
        '        if (range == 1) return 0;',
        '        uint256 rejectBelow = (type(uint256).max % range + 1) % range; // == 2^256 % range',
        '        for (uint256 attempt = 0; attempt < MAX_REJECTION_RETRIES; ++attempt) {',
        '            uint256 word = uint256(keccak256(abi.encode(seed, i, attempt)));',
        '            if (word >= rejectBelow) return uint48(word % range);',
        '        }',
        '        revert("rejection sampling failed");',
        '    }',
        '',
        '    function readVirtual(uint48[] memory pos, uint48[] memory val, uint8 len, uint48 index) internal pure returns (uint48) {',
        '        for (uint8 k = 0; k < len; ++k) if (pos[k] == index) return val[k];',
        '        return index;',
        '    }',
        '',
        '    function writeVirtual(uint48[] memory pos, uint48[] memory val, uint8 len, uint48 index, uint48 value) internal pure returns (uint8) {',
        '        for (uint8 k = 0; k < len; ++k) if (pos[k] == index) { val[k] = value; return len; }',
        '        pos[len] = index;',
        '        val[len] = value;',
        '        return len + 1;',
        '    }',
        ...expectedFn,
        '}',
    ].join('\n')
}

function fetchSeedSnippet(inputs: SnippetInputs): string {
    const rpc = PUBLIC_RPC_URL[inputs.chainId] ?? '$RPC_URL'
    const chain = CHAIN_DISPLAY_NAME[inputs.chainId] ?? `chain ${inputs.chainId}`
    return [
        `# Read the VRF request id and seed straight from the chain (or any RPC for ${chain}).`,
        '# Foundry:',
        `cast call ${inputs.randomNumberProviderAddress} \\`,
        '  "getRandomNumberGeneratorInputsForGameAndRound(address,uint32)(uint256,uint256,uint48,uint8)" \\',
        `  ${inputs.drawAddress} ${inputs.roundIndex} --rpc-url ${rpc}`,
        '',
        '# viem (Node or browser):',
        "import { createPublicClient, http, parseAbi } from 'viem'",
        `const client = createPublicClient({ transport: http('${rpc}') })`,
        'const [requestId, seed, maxNumber, totalNumbers] = await client.readContract({',
        `  address: '${inputs.randomNumberProviderAddress}',`,
        "  abi: parseAbi(['function getRandomNumberGeneratorInputsForGameAndRound(address game, uint32 roundIndex) view returns (uint256 requestId, uint256 seed, uint48 maxNumber, uint8 totalNumbers)']),",
        "  functionName: 'getRandomNumberGeneratorInputsForGameAndRound',",
        `  args: ['${inputs.drawAddress}', ${inputs.roundIndex}],`,
        '})',
        "console.log({ requestId, seed: '0x' + seed.toString(16), maxNumber, totalNumbers })",
    ].join('\n')
}

export function remixUrl(solidity: string): string {
    // UTF-8-safe base64 (the pending-state placeholder contains a non-Latin1 ellipsis).
    return `${REMIX_BASE}#code=${btoa(unescape(encodeURIComponent(solidity)))}${REMIX_QUERY}`
}

export function buildSnippets(inputs: SnippetInputs): Snippet[] {
    const solidity = soliditySnippet(inputs)
    return [
        {
            id: 'js',
            label: 'JavaScript',
            language: 'JavaScript',
            title: 'Paste into your browser console (F12)',
            code: jsSnippet(inputs),
            actions: [{ label: 'Open in RunKit', href: RUNKIT_URL }],
        },
        {
            id: 'python',
            label: 'Python',
            language: 'Python',
            title: 'Run with Python 3.9+',
            code: pythonSnippet(inputs),
            actions: [
                { label: 'Open Replit', href: REPLIT_PYTHON_URL },
                { label: 'Open Colab', href: COLAB_URL },
            ],
        },
        {
            id: 'solidity',
            label: 'Solidity',
            language: 'Solidity',
            title: 'Deploy in Remix and call verify()',
            code: solidity,
            actions: [
                { label: 'Open in Remix', href: remixUrl(solidity) },
                { label: 'Canonical source', href: CANONICAL_SOLIDITY_URL },
            ],
        },
        {
            id: 'fetch-seed',
            label: 'Fetch the seed',
            language: 'Bash / JS',
            title: 'Get the seed without trusting this page',
            code: fetchSeedSnippet(inputs),
            actions: [],
        },
    ]
}
