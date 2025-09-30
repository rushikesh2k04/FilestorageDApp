from algopy import ARC4Contract, arc4, BoxMap, Bytes, Address, Txn, Global, Log


class FileStorageContract(ARC4Contract):
    def __init__(self) -> None:
        # Stores file metadata: key = file_id (Bytes), value = Bytes (CID|permissions)
        self.files = BoxMap(Bytes, Bytes, key_prefix=b"file_")

        # Stores file owner: key = file_id (Bytes), value = Address
        self.owners = BoxMap(Bytes, Address, key_prefix=b"owner_")

        # Optional: track list of file_ids (requires off-chain indexing)
        self.file_list = BoxMap(Bytes, Bytes, key_prefix=b"file_list_")

        # Set contract admin
        self.admin = Global.creator_address()

    @arc4.abimethod
    def add_file(self, file_id: Bytes, cid: Bytes, permissions: Bytes) -> arc4.Bool:
        """Add file metadata with CID and permissions. Only if file doesn't exist."""
        if not file_id or not cid or not permissions:
            return arc4.Bool(False)

        if file_id in self.files:
            return arc4.Bool(False)

        if len(cid) > 256 or len(permissions) > 128:
            return arc4.Bool(False)

        self.files[file_id] = cid + b"|" + permissions
        self.owners[file_id] = Txn.sender
        self.file_list[file_id] = b"1"

        Log.print(f"File added: {file_id.decode()}" .encode())
        return arc4.Bool(True)

    @arc4.abimethod
    def get_file(self, file_id: Bytes) -> Bytes:
        """Get full metadata (CID|permissions) for the given file_id."""
        return self.files.get(file_id, b"")

    @arc4.abimethod
    def get_cid(self, file_id: Bytes) -> Bytes:
        """Return only the CID from stored metadata."""
        metadata = self.files.get(file_id)
        if not metadata:
            return b""
        return metadata.split(b"|")[0]

    @arc4.abimethod
    def get_permissions(self, file_id: Bytes) -> Bytes:
        """Return only the permissions from stored metadata."""
        metadata = self.files.get(file_id)
        if not metadata:
            return b""
        return metadata.split(b"|")[1]

    @arc4.abimethod
    def update_file(self, file_id: Bytes, new_cid: Bytes, new_permissions: Bytes) -> arc4.Bool:
        """Update existing file metadata. Only owner can update."""
        if file_id not in self.files:
            return arc4.Bool(False)

        if Txn.sender != self.owners[file_id]:
            return arc4.Bool(False)

        if not new_cid or not new_permissions:
            return arc4.Bool(False)

        if len(new_cid) > 256 or len(new_permissions) > 128:
            return arc4.Bool(False)

        self.files[file_id] = new_cid + b"|" + new_permissions
        Log.print(f"File updated: {file_id.decode()}".encode())
        return arc4.Bool(True)

    @arc4.abimethod
    def delete_file(self, file_id: Bytes) -> arc4.Bool:
        """Delete file metadata. Only owner can delete."""
        if file_id not in self.files:
            return arc4.Bool(False)

        if Txn.sender != self.owners[file_id]:
            return arc4.Bool(False)

        del self.files[file_id]
        del self.owners[file_id]
        del self.file_list[file_id]

        Log.print(f"File deleted: {file_id.decode()}".encode())
        return arc4.Bool(True)

    @arc4.abimethod
    def delete_file_as_admin(self, file_id: Bytes) -> arc4.Bool:
        """Admin can delete any file."""
        if Txn.sender != self.admin:
            return arc4.Bool(False)

        if file_id in self.files:
            del self.files[file_id]
            del self.owners[file_id]
            del self.file_list[file_id]

            Log.print(f"Admin deleted: {file_id.decode()}".encode())
            return arc4.Bool(True)
        return arc4.Bool(False)

    @arc4.abimethod
    def get_owner(self, file_id: Bytes) -> Address:
        """Returns the owner's address of the given file."""
        return self.owners.get(file_id, Address.zero())

    @arc4.abimethod
    def file_exists(self, file_id: Bytes) -> arc4.Bool:
        """Check if a file exists."""
        return arc4.Bool(file_id in self.files)

    @arc4.abimethod
    def can_access(self, file_id: Bytes, requester: Address) -> arc4.Bool:
        """Simple access control: owner or public or explicitly listed addresses."""
        if file_id not in self.files:
            return arc4.Bool(False)

        owner = self.owners[file_id]
        if requester == owner:
            return arc4.Bool(True)

        metadata = self.files[file_id]
        permissions = metadata.split(b"|")[1]

        if b"public" in permissions:
            return arc4.Bool(True)

        # Check if requester is explicitly listed (addresses separated by commas)
        if requester.encode() in permissions.split(b","):
            return arc4.Bool(True)

        return arc4.Bool(False)
