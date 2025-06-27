import React, { useState } from 'react'
import axios from 'axios'
import { useWallet } from '@txnlab/use-wallet-react'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { FileStorageContractClient } from '../contracts/FileStorageContract'

const PINATA_JWT = 'Bearer YOUR_PINATA_JWT_HERE' // Replace with your real Pinata JWT
const APP_ID = 12345678 // Replace with your deployed ARC4 app ID

const FileUpload: React.FC = () => {
  const [fileId, setFileId] = useState('')
  const [permissions, setPermissions] = useState('public')
  const [file, setFile] = useState<File | null>(null)
  const [cid, setCid] = useState('')
  const [loading, setLoading] = useState(false)

  const { activeAddress, transactionSigner } = useWallet()

  const handleUpload = async () => {
    if (!file || !fileId || !activeAddress) {
      alert('Please select a file and enter a File ID')
      return
    }

    setLoading(true)

    try {
      // Upload to Pinata
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pinataMetadata', JSON.stringify({ name: file.name }))

      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: PINATA_JWT,
        },
      })

      const ipfsHash = res.data.IpfsHash
      setCid(ipfsHash)

      // Call ARC4 contract
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
        cid: ipfsHash,
        permissions,
      })

      alert('✅ File metadata stored on Algorand!')
    } catch (err: any) {
      console.error(err)
      alert(`Upload or contract call failed: ${err.message}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold">Upload File to IPFS & Save Metadata</h2>

      <input
        type="text"
        placeholder="File ID"
        className="input input-bordered w-full"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />

      <select
        className="select select-bordered w-full"
        value={permissions}
        onChange={(e) => setPermissions(e.target.value)}
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>

      <input type="file" className="file-input w-full" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      <button onClick={handleUpload} disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Uploading...' : 'Upload & Save'}
      </button>

      {cid && (
        <p className="text-sm break-words">
          ✅ CID: <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noreferrer">{cid}</a>
        </p>
      )}
    </div>
  )
}

export default FileUpload
