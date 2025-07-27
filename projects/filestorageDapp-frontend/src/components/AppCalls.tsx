import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { X, Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
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

const APP_ID = parseInt(import.meta.env.VITE_APP_ID || '12345678')

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [fileId, setFileId] = useState('')
  const [cid, setCid] = useState('')
  const [permissions, setPermissions] = useState<'public' | 'private'>('public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const isValidCid = (cid: string) => {
    return cid.length >= 46 && (cid.startsWith('Qm') || cid.startsWith('bafy'))
  }

  const handleClose = () => {
    setFileId('')
    setCid('')
    setPermissions('public')
    setError(null)
    setSuccess(null)
    setModalState(false)
  }

  const callAddFile = async () => {
    if (!fileId.trim() || !cid.trim() || !activeAddress) {
      setError('Please fill all fields and connect your wallet.')
      return
    }

    if (!isValidCid(cid)) {
      setError('Please enter a valid IPFS CID (should start with Qm or bafy)')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

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
      })

      setSuccess('Metadata stored successfully on-chain!')
      enqueueSnackbar('✅ Metadata stored successfully on-chain!', { variant: 'success' })
      
      // Reset form after success
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (err: any) {
      console.error('Contract call failed:', err)
      const errorMessage = err?.message || 'Transaction failed'
      setError(errorMessage)
      enqueueSnackbar(`❌ Error: ${errorMessage}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!openModal) return null

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={handleClose} />
      <div className="modal-content animate-slide-up">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Manually Add File Metadata
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
              <p className="text-error-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
              <p className="text-success-700 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="modal-fileId" className="block text-sm font-medium text-gray-700 mb-2">
                File ID
              </label>
              <input
                id="modal-fileId"
                type="text"
                placeholder="Enter unique file identifier"
                className="input"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="modal-cid" className="block text-sm font-medium text-gray-700 mb-2">
                IPFS CID
              </label>
              <input
                id="modal-cid"
                type="text"
                placeholder="QmXXXXXX... or bafyXXXXXX..."
                className={`input ${cid && !isValidCid(cid) ? 'input-error' : ''}`}
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                disabled={loading}
              />
              {cid && !isValidCid(cid) && (
                <p className="mt-1 text-sm text-error-600">
                  Please enter a valid IPFS CID
                </p>
              )}
            </div>

            {isValidCid(cid) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  🔗 Preview:{" "}
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    View on IPFS
                  </a>
                </p>
              </div>
            )}

            <div>
              <label htmlFor="modal-permissions" className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <select
                id="modal-permissions"
                className="select"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value as 'public' | 'private')}
                disabled={loading}
              >
                <option value="public">🌐 Public</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={callAddFile}
              disabled={loading || !fileId.trim() || !cid.trim() || !isValidCid(cid)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Submit to Blockchain
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppCalls