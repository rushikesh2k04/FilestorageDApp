"use client";

import React, { useState } from "react";
import {
  Button,
  Snackbar,
  Alert,
  LinearProgress,
  TextField,
} from "@mui/material";
import axios from "axios";
import algosdk from "algosdk";
import { makeStdLib } from "@reach-sh/stdlib";

// --- CONFIG ---
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!;
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = "";
const ALGOD_TOKEN = "";
const APP_ID = parseInt(process.env.NEXT_PUBLIC_APP_ID || "0");

// --- ALGOD CLIENT ---
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; cid: string; url: string }[]
  >([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 100 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "File size must be ≤ 100MB",
          severity: "error",
        });
        return;
      }
      setFile(f);
    }
  };

  const uploadToIPFS = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxContentLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
          onUploadProgress: (p) => {
            if (p.total) {
              setProgress(Math.round((p.loaded * 100) / p.total));
            }
          },
        }
      );

      const cid = res.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

      // --- Store metadata on Algorand ---
      await addFileToAlgorand(file.name, cid);

      // --- Optional: store in backend DB ---
      await axios.post("/api/files", { name: file.name, cid });

      setUploadedFiles((prev) => [...prev, { name: file.name, cid, url }]);
      setSnackbar({
        open: true,
        message: "File uploaded successfully!",
        severity: "success",
      });
      setFile(null);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Upload failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const addFileToAlgorand = async (fileId: string, cid: string) => {
    try {
      const accounts = await (window as any).algo?.accounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No Algorand wallet connected");
      }
      const sender = accounts[0].address;

      const params = await algodClient.getTransactionParams().do();

      const atc = new algosdk.AtomicTransactionComposer();
      const appCall = algosdk.makeApplicationNoOpTxn(
        sender,
        params,
        APP_ID,
        [new Uint8Array(Buffer.from("add_file")), new Uint8Array(Buffer.from(fileId)), new Uint8Array(Buffer.from(cid))]
      );

      atc.addTransaction({ txn: appCall, signer: algosdk.makeBasicAccountTransactionSigner({ addr: sender, sk: new Uint8Array(0) }) });
      await atc.execute(algodClient, 2);
    } catch (err) {
      console.error("Algorand call failed", err);
      throw err;
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-md bg-white max-w-lg mx-auto">
      <h2 className="text-lg font-bold mb-2">Upload File</h2>

      <TextField
        type="file"
        onChange={handleFileChange}
        fullWidth
        inputProps={{ accept: "*" }}
        disabled={loading}
      />

      {loading && (
        <div className="mt-3">
          <LinearProgress variant="determinate" value={progress} />
        </div>
      )}

      <Button
        variant="contained"
        color="primary"
        className="mt-3"
        fullWidth
        onClick={uploadToIPFS}
        disabled={!file || loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </Button>

      <div className="mt-5">
        <h3 className="text-md font-semibold mb-2">Uploaded Files</h3>
        {uploadedFiles.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gray-100 rounded p-2 mb-2"
          >
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {f.name}
            </a>
            <Button
              color="error"
              size="small"
              onClick={() =>
                setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default FileUpload;
