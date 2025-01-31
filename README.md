# DocuChain

A decentralized document verification and storage system built on Stacks blockchain.

## Features
- Store document hashes on-chain
- Verify document authenticity 
- Track document history
- Manage document access permissions
- Support document metadata

## Usage

### Store a document
```clarity
(contract-call? .docuchain store-document 
    "QmHash..." 
    "Document Title"
    "application/pdf"
)
```

### Verify a document
```clarity
(contract-call? .docuchain verify-document "QmHash...")
```

## Development

1. Clone the repository
2. Install dependencies with `clarinet install`
3. Run tests with `clarinet test`

## License
MIT
