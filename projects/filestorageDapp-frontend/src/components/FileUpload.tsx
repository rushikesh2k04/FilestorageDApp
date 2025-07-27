import React, { useState, useCallback } from 'react'
import axios from 'axios'
import { useWallet } from '@txnlab/use-wallet-react'
import { Upload, File, Image, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { FileStorageContractClient } from '../contracts/FileStorageContract'

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || 'Bearer YOUR_PINATA_JWT_HERE'
const APP_ID = parseInt(import.meta.env.VITE_APP_ID || '12345678')

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  cid: string
  permissions: string
  uploadedAt: Date
}

const FileUpload: React.FC = () => {
  const [fileId, setFileId] = useState('')
  const [permissions, setPermissions] = useState<'public' | 'private'>('public')
  const [file, setFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const { activeAddress, transactionSigner } = useWallet()

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const validateFile = (file: File): string | null => {
    const maxSize = 100 * 1024 * 1024 // 100MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'text/plain']
    
    if (file.size > maxSize) {
      return 'File size exceeds 100MB limit'
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Unsupported file type. Please upload PNG, JPEG, PDF, or TXT files.'
    }
    
    return null
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const validationError = validateFile(droppedFile)
      
      if (validationError) {
        setError(validationError)
        return
      }
      
      setFile(droppedFile)
      setFileId(droppedFile.name.replace(/\.[^/.]+$/, ''))
      clearMessages()
    }
  }, [clearMessages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
    setFileId(selectedFile.name.replace(/\.[^/.]+$/, ''))
    clearMessages()
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (!file || !fileId.trim() || !activeAddress) {
      setError('Please enter File ID, choose a file, and connect your wallet!')
      return
    }

    if (PINATA_JWT === 'Bearer YOUR_PINATA_JWT_HERE') {
      setError('Please configure your Pinata JWT token in the environment variables.')
      return
    }

    setLoading(true)
    setProgress(0)
    clearMessages()

    try {
      // Upload to IPFS via Pinata
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pinataMetadata', JSON.stringify({ 
        name: file.name,
        keyvalues: {
          fileId: fileId,
          permissions: permissions,
          uploader: activeAddress
        }
      }))

      const uploadResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS', 
        formData, 
        {
          maxBodyLength: Infinity,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: PINATA_JWT,
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
            setProgress(percent)
          },
        }
      )

      const ipfsHash = uploadResponse.data.IpfsHash
      setProgress(100)

      // Store metadata on Algorand blockchain
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

      // Store in backend database
      try {
        await axios.post('http://localhost:5000/api/files', {
          fileId,
          cid: ipfsHash,
          permissions,
          uploader: activeAddress,
        })
      } catch (backendError) {
        console.warn('Backend storage failed:', backendError)
        // Continue even if backend fails
      }

      // Add to uploaded files list
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        cid: ipfsHash,
        permissions,
        uploadedAt: new Date(),
      }

      setUploadedFiles(prev => [newFile, ...prev])
      setSuccess(`File uploaded successfully! CID: ${ipfsHash}`)
      
      // Reset form
      setFileId('')
      setPermissions('public')
      setFile(null)
      setProgress(0)

    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(`Upload failed: ${err.response?.data?.message || err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Upload File to IPFS</h2>
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

        <div className="space-y-4">
          {/* File ID Input */}
          <div>
            <label htmlFor="fileId" className="block text-sm font-medium text-gray-700 mb-2">
              File ID
            </label>
            <input
              id="fileId"
              type="text"
              placeholder="Enter unique file identifier"
              className="input"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Permissions Select */}
          <div>
            <label htmlFor="permissions" className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <select
              id="permissions"
              className="select"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value as 'public' | 'private')}
              disabled={loading}
            >
              <option value="public">🌐 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                dragActive
                  ? 'border-primary-400 bg-primary-50'
                  : file
                  ? 'border-success-300 bg-success-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                disabled={loading}
                accept=".png,.jpg,.jpeg,.pdf,.txt"
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(file.type)}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drop your file here or <span className="text-primary-600 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPEG, PDF, TXT up to 100MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {progress > 0 && progress < 100 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file || !fileId.trim() || !activeAddress}
            className="btn btn-primary w-full py-3 text-base font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {progress < 100 ? 'Uploading to IPFS...' : 'Storing on Blockchain...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload & Store
              </>
            )}
          </button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadedFile.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.size)} • {uploadedFile.permissions} • 
                      {uploadedFile.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${uploadedFile.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View
                  </a>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-xs text-gray-400 hover:text-error-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload