import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
} from "@mui/material";
import { FileStorageContractClient } from "../contracts/FileStorageContractClient";
import algosdk from "algosdk";
import { useWallet } from "@txnlab/use-wallet";

// --- Custom Hook for Form State & Validation ---
function useFileForm() {
  const [fileId, setFileId] = useState("");
  const [cid, setCid] = useState("");
  const [permissions, setPermissions] = useState("private");
  const [errors, setErrors] = useState({ fileId: "", cid: "" });

  const validate = () => {
    let valid = true;
    const newErrors = { fileId: "", cid: "" };

    if (!fileId.trim()) {
      newErrors.fileId = "File ID is required";
      valid = false;
    }

    if (!cid.trim()) {
      newErrors.cid = "CID is required";
      valid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(cid)) {
      newErrors.cid = "Invalid CID format";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  return {
    fileId,
    setFileId,
    cid,
    setCid,
    permissions,
    setPermissions,
    errors,
    validate,
    reset: () => {
      setFileId("");
      setCid("");
      setPermissions("private");
      setErrors({ fileId: "", cid: "" });
    },
  };
}

// --- Main Component ---
const AppCalls = ({ open, handleClose }) => {
  const {
    fileId,
    setFileId,
    cid,
    setCid,
    permissions,
    setPermissions,
    errors,
    validate,
    reset,
  } = useFileForm();

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [loading, setLoading] = useState(false);

  const { signer, activeAddress } = useWallet();

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const algodClient = new algosdk.Algodv2(
        "",
        "https://testnet-api.algonode.cloud",
        ""
      );

      const appClient = new FileStorageContractClient(
        {
          client: algodClient,
          signer,
          sender: activeAddress,
          appId: import.meta.env.VITE_APP_ID,
        }
      );

      await appClient.add_file({ fileId, cid, permissions });

      setSnackbar({ open: true, message: "File metadata submitted successfully!", severity: "success" });
      reset();
      handleClose();
    } catch (error) {
      console.error("Error adding file metadata:", error);
      setSnackbar({ open: true, message: "Error adding file metadata. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Manually Add File Metadata</DialogTitle>
        <DialogContent>
          <TextField
            label="File ID"
            fullWidth
            margin="dense"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            error={!!errors.fileId}
            helperText={errors.fileId}
            disabled={loading}
          />
          <TextField
            label="CID"
            fullWidth
            margin="dense"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            error={!!errors.cid}
            helperText={errors.cid}
            disabled={loading}
          />
          {cid && !errors.cid && (
            <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Preview:{" "}
              <a
                href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cid}
              </a>
            </p>
          )}
          <TextField
            select
            label="Permissions"
            fullWidth
            margin="dense"
            value={permissions}
            onChange={(e) => setPermissions(e.target.value)}
            disabled={loading}
            SelectProps={{ native: true }}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default AppCalls;
