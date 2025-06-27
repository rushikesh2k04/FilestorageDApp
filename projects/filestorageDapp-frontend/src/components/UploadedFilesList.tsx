import React from 'react'

interface UploadedFile {
  id: string
  cid: string
  permissions: string
}

const UploadedFilesList = ({ files }: { files: UploadedFile[] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-6">
      <h2 className="text-lg font-semibold mb-4">📁 Uploaded Files</h2>
      {files.length === 0 ? (
        <p className="text-gray-500">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {files.map(({ id, cid, permissions }) => (
            <li key={id} className="border-b pb-2">
              <p className="font-medium">🆔 {id}</p>
              <p>🔗 <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} className="text-blue-500" target="_blank" rel="noreferrer">{cid}</a></p>
              <p>🔒 Permissions: {permissions}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UploadedFilesList
