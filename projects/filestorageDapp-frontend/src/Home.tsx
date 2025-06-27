import React, { useState } from 'react'
import FileUpload from './components/FileUpload'
import AppCalls from './components/AppCalls'

const Home: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📦 Decentralized File Storage</h1>
      <FileUpload />
      <div className="text-center mt-6">
        <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>
          Open Manual Input
        </button>
      </div>
      <AppCalls openModal={modalOpen} setModalState={setModalOpen} />
    </div>
  )
}

export default Home
