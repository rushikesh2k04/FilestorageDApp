import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { FileStorageContractClient } from '../contracts/FileStorageContract'
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment
} from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const APP_ID = 12345678 // Replace with your actual deployed App ID

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [fileId, setFileId] = useState('')
  const [cid, setCid] = useState('')
  const [permissions, setPermissions] = useState<'public' | 'private'>('public')
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const isValidCid = (cid: string) => cid.length >= 46 && cid.startsWith('Qm')

  const handleClose = () => {
    setFileId('')
    setCid('')
    setPermissions('public')
    setModalState(false)
  }

  const callAddFile = async () => {
    if (!fileId.trim() || !cid.trim() || !activeAddress) {
      enqueueSnackbar('⚠️ Please fill all fields and connect your wallet.', { variant: 'warning' })
      return
    }

    setLoading(true)

    try {
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const indexerConfig = getIndexerConfigFromViteEnvironment()

      const algorand = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
      algorand.setDefaultSigner(transactionSigner)

      const contract = new FileStorageContractClient({
        resolveBy: 'id',
        id: APP_ID,
        sender: activeAddress,
        algorand,
      })

      await contract.add_file({
        file_id: fileId,
        cid,
        permissions,
        is_public: permissions === 'public',
      })

      enqueueSnackbar('✅ Metadata stored successfully on-chain!', { variant: 'success' })
      handleClose()
    } catch (err: any) {
      console.error(err)
      enqueueSnackbar(`❌ Error: ${err?.message || 'Transaction failed'}`, { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box space-y-4">
        <h3 className="font-bold text-lg">📄 Manually Add File Metadata</h3>

        <input
          type="text"
          placeholder="File ID"
          className="input input-bordered w-full"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
        />
        <input
          type="text"
          placeholder="CID (IPFS Hash)"
          className="input input-bordered w-full"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        />

        {isValidCid(cid) && (
          <p className="text-xs text-blue-600">
            🔗 Preview:{" "}
            <a
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {cid}
            </a>
          </p>
        )}

        <select
          className="select select-bordered w-full"
          value={permissions}
          onChange={(e) => setPermissions(e.target.value as 'public' | 'private')}
        >
          <option value="public">🌐 Public</option>
          <option value="private">🔒 Private</option>
        </select>

        <div className="modal-action">
          <button type="button" className="btn" onClick={handleClose}>Close</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={callAddFile}
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '📬 Submit'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
