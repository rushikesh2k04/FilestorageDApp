import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Database, Wallet, Settings, ExternalLink, Github } from 'lucide-react'
import FileUpload from './components/FileUpload'
import AppCalls from './components/AppCalls'
import ConnectWallet from './components/ConnectWallet'

const Home: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass border-b border-white border-opacity-20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FileStorage dApp</h1>
                <p className="text-xs text-gray-600">Decentralized • Secure • Permanent</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {activeAddress ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Connected</p>
                    <p className="text-xs text-gray-600">
                      {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className="btn btn-secondary"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="btn btn-primary"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">
            Decentralized File Storage
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Upload files to IPFS, store metadata on Algorand blockchain, and access them from anywhere. 
            Built with cutting-edge Web3 technology for permanent, censorship-resistant storage.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm font-medium text-gray-700 border border-white border-opacity-40">
              🔒 Secure & Private
            </div>
            <div className="px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm font-medium text-gray-700 border border-white border-opacity-40">
              🌐 IPFS Storage
            </div>
            <div className="px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm font-medium text-gray-700 border border-white border-opacity-40">
              ⛓️ Algorand Blockchain
            </div>
            <div className="px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm font-medium text-gray-700 border border-white border-opacity-40">
              📱 Responsive Design
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {activeAddress ? (
          <div className="space-y-8">
            <FileUpload />
            
            {/* Manual Input Button */}
            <div className="text-center">
              <button
                className="btn btn-secondary hover-lift"
                onClick={() => setModalOpen(true)}
              >
                <Database className="w-4 h-4 mr-2" />
                Manual Metadata Input
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Already have an IPFS CID? Add it directly to the blockchain.
              </p>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              To start uploading files and interacting with the blockchain, please connect your Algorand wallet.
            </p>
            <button
              onClick={() => setWalletModalOpen(true)}
              className="btn btn-primary btn-lg"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-600 text-sm">
                Built with ❤️ using Algorand, IPFS & React
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Powered by AlgoKit • Pinata • Tailwind CSS
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://developer.algorand.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AppCalls openModal={modalOpen} setModalState={setModalOpen} />
      <ConnectWallet 
        openModal={walletModalOpen} 
        closeModal={() => setWalletModalOpen(false)} 
      />
    </div>
  )
}

export default Home