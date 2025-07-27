import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const [copied, setCopied] = useState(false)
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLowerCase()
  }, [algoConfig.network])

  const copyAddress = async () => {
    if (activeAddress) {
      await navigator.clipboard.writeText(activeAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getExplorerUrl = () => {
    const baseUrls = {
      mainnet: 'https://allo.info',
      testnet: 'https://testnet.allo.info',
      localnet: 'https://lora.algokit.io/localnet'
    }
    
    const baseUrl = baseUrls[networkName as keyof typeof baseUrls] || baseUrls.localnet
    return `${baseUrl}/account/${activeAddress}`
  }

  return (
    <div className="space-y-3">
      {/* Address */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Wallet Address</p>
          <p className="text-lg font-mono text-gray-900">
            {ellipseAddress(activeAddress, 8)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy address"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-success-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </a>
        </div>
      </div>

      {/* Network */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div>
          <p className="text-sm font-medium text-gray-700">Network</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              networkName === 'mainnet' ? 'bg-success-500' :
              networkName === 'testnet' ? 'bg-warning-500' :
              'bg-blue-500'
            }`} />
            <p className="text-sm text-gray-900 capitalize">{networkName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account