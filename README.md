
## 📦 Decentralized File Storage dApp

A decentralized application (dApp) for uploading files to IPFS (via Pinata), storing metadata on the Algorand blockchain using a smart contract, and saving file details in a MySQL database for centralized querying.

---

## 🧠 Overview

### 🔗 Tech Stack

| Layer         | Tech Used                                       |
|---------------|-------------------------------------------------|
| Smart Contract| Algorand ARC4 using Algopy (Python)             |
| Frontend      | React + Tailwind + use-wallet-react             |
| Backend       | Node.js + Express + Sequelize + MySQL           |
| Storage       | IPFS via [Pinata](https://pinata.cloud)         |

---

## 📁 Project Structure

```
filestorage-DApp/projects
│
├── backend/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── index.js
│   │   └── File.js
│   ├── controllers/
│   │   └── fileController.js
│   ├── routes/
│   │   └── fileRoutes.js
│   └── .env
│
├── filestorage-DApp-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── FileUpload.tsx
│   │   │   └── AppCalls.tsx
│   │   ├── contracts/
│   │   │   └── FileStorageContractClient.ts
│   │   ├── utils/
│   │   │   └── getAlgoClientConfigs.ts
│   │   └── App.tsx, main.tsx, Home.tsx
│   └── .env
│
├── filestorage-DApp-contracts/smart_contracts/filestorage
│   └── contract.py
│   └── deploy_config.py
│
└── README.md
```

---

## ✅ Features

- 🔐 **IPFS Upload** using Pinata JWT
- 📡 **Smart contract interaction** to save CID & permissions on-chain
- 💾 **Backend integration** to log metadata in MySQL
- 🪙 **Wallet authentication** via `@txnlab/use-wallet-react`
- 📊 **Upload progress bar** and live previews (image/PDF)

---

## ⚙️ Setup Instructions

### 1. 📜 Smart Contract (Algorand)

> Requirements: Python 3.10+, Algokit

```bash
cd smart_contracts
poetry install
poetry run python deploy.py
```

> ⚠️ Save the `APP_ID` generated. Replace it in frontend/backend.

---

### 2. 🖼 Frontend (React + Vite)

> Requirements: Node.js, pnpm/yarn/npm

```bash
cd frontend
npm install
# Set environment variables in .env
VITE_ALGOD_TOKEN=...
VITE_PINATA_JWT=Bearer YOUR_JWT_HERE
VITE_APP_ID=12345678
```

> Run locally:

```bash
npm run dev
```

---

### 3. 🖥 Backend (Node.js + MySQL)

> Requirements: Node.js, MySQL running locally

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=file_storage
```

> Start backend server:

```bash
node app.js
```

---

## 📦 API Endpoints (Backend)

| Method | Endpoint          | Description                 |
|--------|-------------------|-----------------------------|
| POST   | `/api/files`      | Store file metadata in DB   |
| GET    | `/api/files`      | (Optional) Fetch all files  |

---

## 💻 Frontend Preview

- Upload files (PNG, JPG, PDF under 100MB)
- View CID, preview file (image/PDF)
- Interact with smart contract + backend

---

## 🔐 Smart Contract Logic (ARC4)

```python
@arc4.abimethod
def add_file(file_id: Bytes, cid: Bytes, permissions: Bytes, is_public: Bool) -> arc4.Bool:
    # Store metadata in BoxMap
```
```python
@arc4.abimethod
def get_file(file_id: Bytes) -> Bytes:
    # Return CID and permissions if public or owned by sender
```
```python
@arc4.abimethod
def update_file(file_id: Bytes, new_cid: Bytes, new_permissions: Bytes) -> arc4.Bool:
    # Update CID and permissions if sender is owner
```
```python
@arc4.abimethod
def delete_file(file_id: Bytes) -> arc4.Bool:
    # Delete metadata if sender is owner
```
```python
@arc4.abimethod
def get_views(file_id: Bytes) -> UInt64:
    # Return number of views for a file

```
```python
@arc4.abimethod
def file_exists(file_id: Bytes) -> Bool:
    # Check if file exists in storage

```

---

## 👨‍💻 Author

**Rushikesh Ponnala**
