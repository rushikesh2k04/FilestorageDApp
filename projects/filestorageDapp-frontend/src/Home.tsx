import React, { useState } from 'react'
import FileUpload from './components/FileUpload'
import AppCalls from './components/AppCalls'
import { useWallet } from '@txnlab/use-wallet-react'

const Home: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-100 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800 dark:text-white tracking-tight">
          📦 Decentralized File Storage dApp
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {activeAddress ? (
            <>
              <FileUpload />
              <div className="text-center mt-6">
                <button
                  className="btn btn-secondary bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
                  onClick={() => setModalOpen(true)}
                >
                  🛠️ Open Manual Input
                </button>
              </div>
              <AppCalls openModal={modalOpen} setModalState={setModalOpen} />
            </>
          ) : (
            <p className="text-center text-red-600 font-medium text-lg mt-4">
              ❗ Please connect your wallet to interact with the dApp.
            </p>
          )}
        </div>

        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
          Built with ❤️ using Algorand, IPFS & React
        </footer>
      </div>
    </div>
  )
}

export default Home
