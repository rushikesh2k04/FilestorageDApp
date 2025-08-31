import React, { useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { Database, Wallet, Settings, ExternalLink, Github } from "lucide-react"
import FileUpload from "./components/FileUpload"
import AppCalls from "./components/AppCalls"
import ConnectWallet from "./components/ConnectWallet"

const Home: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  FileStorage dApp
                </h1>
                <p className="text-xs text-gray-600">
                  Decentralized • Secure • Permanent
                </p>
              </div>
            </div>

            {/* Wallet Section */}
            <div className="flex items-center gap-3">
              {activeAddress ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      Connected
                    </p>
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
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-primary-500 mb-4">
            Decentralized File Storage
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Upload files to <span className="font-semibold">IPFS</span>, store
            metadata on{" "}
            <span className="font-semibold">Algorand Blockchain</span>, and
            access them from anywhere. Permanent, censorship-resistant storage
            for the future.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {["🔒 Secure & Private", "🌐 IPFS Storage", "⛓️ Algorand Blockchain", "📱 Responsive Design"].map(
              (feature, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-white/70 rounded-full text-sm font-medium text-gray-700 border border-white/40 shadow-sm"
                >
                  {feature}
                </div>
              )
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {activeAddress ? (
          <div className="space-y-10">
            <FileUpload />

            {/* Manual Input */}
            <div className="text-center">
              <button
                className="btn btn-secondary hover:shadow-md hover:-translate-y-0.5 transition"
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
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
              <Wallet className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              To start uploading files and interacting with the blockchain,
              please connect your Algorand wallet.
            </p>
            <button
              onClick={() => setWalletModalOpen(true)}
              className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
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
