import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { FileStorageContractClient } from '../contracts/FileStorageContract'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const APP_ID = 12345678 // Replace with your deployed App ID

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [fileId, setFileId] = useState('')
  const [cid, setCid] = useState('')
  const [permissions, setPermissions] = useState('public')
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const callAddFile = async () => {
    if (!fileId || !cid || !activeAddress) return

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

      await contract.add_file({ file_id: fileId, cid, permissions })
      enqueueSnackbar('✅ File metadata stored!', { variant: 'success' })
    } catch (err: any) {
      enqueueSnackbar(`❌ Error: ${err.message}`, { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box space-y-4">
        <h3 className="font-bold text-lg">Manually Add File Metadata</h3>

        <input
          type="text"
          placeholder="File ID"
          className="input input-bordered w-full"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
        />
        <input
          type="text"
          placeholder="CID"
          className="input input-bordered w-full"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        />
        <select className="select select-bordered w-full" value={permissions} onChange={(e) => setPermissions(e.target.value)}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <div className="modal-action">
          <button className="btn" onClick={() => setModalState(false)}>Close</button>
          <button className="btn btn-primary" onClick={callAddFile} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
