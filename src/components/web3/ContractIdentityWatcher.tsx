import useContractIdentities from '@/hooks/contracts/useContractIdentities'

// Mounts the contract-identity probe once inside the web3 provider tree
// (task 115). Renders nothing — findings surface as sonner toasts plus
// console.table diagnostics from the hook itself.
export default function ContractIdentityWatcher() {
    useContractIdentities()
    return null
}
