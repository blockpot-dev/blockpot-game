import { useCallback, useEffect, useRef, useState } from 'react'
import { Address } from 'viem'
import useLifetimeSnapshot from '@/hooks/contracts/lgo/useLifetimeSnapshot'
import useAccountAddress from '@/hooks/utilities/useAccountAddress'
import { ZERO_ADDRESS } from '@/web3/constants'

export type SessionSnapshot = {
    startedAt: number
    wageredEurMinor: bigint
    wonEurMinor: bigint
    elapsedMs: number
}

export type UseSessionTimerOptions = {
    intervalMinutes: number
    enabled: boolean
}

type SessionStorageRecord = {
    startedAt: number
    wageredEurMinorAtStart: string
    wonEurMinorAtStart: string
    lastNotifiedAt: number
}

const STORAGE_PREFIX = 'bp:rg:session:'

function storageKey(address: Address): string {
    return `${STORAGE_PREFIX}${address.toLowerCase()}`
}

function readRecord(address: Address): SessionStorageRecord | null {
    try {
        const raw = window.localStorage.getItem(storageKey(address))
        if (!raw) return null
        const parsed = JSON.parse(raw) as SessionStorageRecord
        if (
            typeof parsed.startedAt !== 'number'
            || typeof parsed.lastNotifiedAt !== 'number'
            || typeof parsed.wageredEurMinorAtStart !== 'string'
            || typeof parsed.wonEurMinorAtStart !== 'string'
        ) {
            return null
        }
        return parsed
    } catch {
        return null
    }
}

function writeRecord(address: Address, record: SessionStorageRecord): void {
    try {
        window.localStorage.setItem(storageKey(address), JSON.stringify(record))
    } catch {
        // localStorage unavailable / quota — degrade silently to in-memory only
    }
}

function clearRecord(address: Address): void {
    try {
        window.localStorage.removeItem(storageKey(address))
    } catch {
        // ignore
    }
}

function diffNonNegative(current: bigint, baseline: bigint): bigint {
    return current > baseline ? current - baseline : 0n
}

// Mounted on /play. Captures a baseline of on-chain `lifetimeWageredEurMinor` /
// `lifetimeWonEurMinor` when the session begins; session totals are the live
// lifetime values minus that baseline. Persists per-address in localStorage so
// reloads continue the same session, and exposes a `dueForReminder` flag the
// modal consumes to fire at the configured interval.
export default function useSessionTimer({ intervalMinutes, enabled }: UseSessionTimerOptions) {
    const address = useAccountAddress()
    const { snapshot, isLoading } = useLifetimeSnapshot(address as Address)

    const [record, setRecord] = useState<SessionStorageRecord | null>(null)
    const [now, setNow] = useState(() => Date.now())
    const initialisedAddressRef = useRef<Address | null>(null)

    // Bootstrap on first mount per address: load existing session or open a
    // new one once the `lifetimeWageredEurMinor` / `lifetimeWonEurMinor`
    // baseline is available.
    useEffect(() => {
        if (!enabled) return
        if (address === ZERO_ADDRESS) return
        if (initialisedAddressRef.current === address) return
        if (isLoading || !snapshot) return

        const existing = readRecord(address as Address)
        if (existing) {
            setRecord(existing)
        } else {
            const fresh: SessionStorageRecord = {
                startedAt: Date.now(),
                wageredEurMinorAtStart: snapshot.wageredEurMinor.toString(),
                wonEurMinorAtStart: snapshot.wonEurMinor.toString(),
                lastNotifiedAt: Date.now(),
            }
            writeRecord(address as Address, fresh)
            setRecord(fresh)
        }
        initialisedAddressRef.current = address as Address
    }, [enabled, address, isLoading, snapshot])

    // Reset state when the address changes (incl. disconnect).
    useEffect(() => {
        if (initialisedAddressRef.current && initialisedAddressRef.current !== address) {
            initialisedAddressRef.current = null
            setRecord(null)
        }
    }, [address])

    useEffect(() => {
        if (!enabled || !record) return
        const id = window.setInterval(() => setNow(Date.now()), 30_000)
        return () => window.clearInterval(id)
    }, [enabled, record])

    const acknowledge = useCallback(() => {
        if (!record || address === ZERO_ADDRESS) return
        const next: SessionStorageRecord = { ...record, lastNotifiedAt: Date.now() }
        writeRecord(address as Address, next)
        setRecord(next)
    }, [record, address])

    const endSession = useCallback(() => {
        if (address === ZERO_ADDRESS) return
        clearRecord(address as Address)
        initialisedAddressRef.current = null
        setRecord(null)
    }, [address])

    const wageredAtStart = record ? BigInt(record.wageredEurMinorAtStart) : 0n
    const wonAtStart = record ? BigInt(record.wonEurMinorAtStart) : 0n
    const liveWagered = snapshot?.wageredEurMinor ?? 0n
    const liveWon = snapshot?.wonEurMinor ?? 0n
    const sessionWagered = record ? diffNonNegative(liveWagered, wageredAtStart) : 0n
    const sessionWon = record ? diffNonNegative(liveWon, wonAtStart) : 0n

    const elapsedMs = record ? Math.max(0, now - record.startedAt) : 0
    const intervalMs = Math.max(intervalMinutes * 60 * 1000, 60_000)
    const dueForReminder = !!record
        && enabled
        && now - record.lastNotifiedAt >= intervalMs

    const sessionSnapshot: SessionSnapshot | null = record
        ? {
            startedAt: record.startedAt,
            wageredEurMinor: sessionWagered,
            wonEurMinor: sessionWon,
            elapsedMs,
        }
        : null

    return {
        snapshot: sessionSnapshot,
        dueForReminder,
        acknowledge,
        endSession,
    }
}
