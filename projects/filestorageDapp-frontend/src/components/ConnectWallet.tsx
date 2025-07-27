import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import { X, Wallet as WalletIcon, LogOut, ExternalLink } from 'lucide-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  const handleLogout = async () => {
    if (wallets) {
      const activeWallet = wallets.find((w) => w.isActive)
      if (activeWallet) {
        await activeWallet.disconnect()
      } else {
        // Required for logout/cleanup of inactive providers
        localStorage.removeItem('@txnlab/use-wallet:v3')
        window.location.reload()
      }
    }
  }

  if (!openModal) return null

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={closeModal} />
      <div className="modal-content animate-slide-up">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <WalletIcon className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
              </h3>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Connected Account Info */}
          {activeAddress && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
              <Account />
            </div>
          )}

          {/* Wallet Providers */}
          {!activeAddress && (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Choose a wallet provider to connect to the Algorand network:
              </p>
              
              {wallets?.map((wallet) => (
                <button
                  key={`provider-${wallet.id}`}
                  data-test-id={`${wallet.id}-connect`}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => wallet.connect()}
                >
                  {!isKmd(wallet) && (
                    <img
                      alt={`${wallet.id} wallet icon`}
                      src={wallet.metadata.icon}
                      className="w-8 h-8 rounded-lg"
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isKmd(wallet) 
                        ? 'For local development and testing'
                        : `Connect with ${wallet.metadata.name}`
                      }
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              data-test-id="close-wallet-modal"
              className="btn btn-secondary flex-1"
              onClick={closeModal}
            >
              Close
            </button>
            
            {activeAddress && (
              <button
                className="btn btn-error flex-1"
                data-test-id="logout"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </button>
            )}
          </div>

          {/* Network Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Make sure you're connected to the correct Algorand network for your intended use.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet