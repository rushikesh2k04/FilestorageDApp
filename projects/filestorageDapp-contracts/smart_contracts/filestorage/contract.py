from algopy import ARC4Contract, arc4, BoxMap, Bytes

class FileStorageContract(ARC4Contract):
    def __init__(self) -> None:
        # BoxMap: key = file_id (Bytes), value = file metadata (Bytes)
        self.files = BoxMap(Bytes, Bytes, key_prefix=b"file_")

    @arc4.abimethod
    def add_file(self, file_id: Bytes, cid: Bytes, permissions: Bytes) -> arc4.Bool:
        """
        Store file metadata (CID and permissions) for a given file_id.
        """
        # Store as a simple concatenation; for more complex needs, use a serialization format
        value = cid + b"|" + permissions
        self.files[file_id] = value
        return arc4.Bool(True)
    @arc4.abimethod
    def get_file(self, file_id: Bytes) -> Bytes:
        """
        Retrieve file metadata for a given file_id.
        """
        return self.files[file_id]
