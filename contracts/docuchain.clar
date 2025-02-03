;; DocuChain - Document verification and storage system

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-already-exists (err u409))
(define-constant err-invalid-status (err u400))

;; Data structures
(define-map documents
  { hash: (string-ascii 64) }
  {
    owner: principal,
    title: (string-ascii 256),
    mime-type: (string-ascii 64),
    timestamp: uint,
    status: (string-ascii 16)
  }
)

(define-map document-access 
  { hash: (string-ascii 64), user: principal }
  { can-read: bool, can-update: bool }
)

;; Public functions
(define-public (store-document (hash (string-ascii 64)) (title (string-ascii 256)) (mime-type (string-ascii 64)))
  (let ((existing-doc (get-document-info hash)))
    (asserts! (is-none existing-doc) err-already-exists)
    (map-set documents
      { hash: hash }
      {
        owner: tx-sender,
        title: title,
        mime-type: mime-type,
        timestamp: block-height,
        status: "active"
      }
    )
    (map-set document-access
      { hash: hash, user: tx-sender }
      { can-read: true, can-update: true }
    )
    (ok true)
  )
)

(define-public (verify-document (hash (string-ascii 64)))
  (let ((doc-info (get-document-info hash)))
    (match doc-info
      doc (ok doc)
      err-not-found
    )
  )
)

(define-public (grant-access (hash (string-ascii 64)) (user principal) (can-read bool) (can-update bool))
  (let ((doc-info (get-document-info hash)))
    (asserts! (is-eq tx-sender (get owner (unwrap! doc-info err-not-found))) err-unauthorized)
    (map-set document-access
      { hash: hash, user: user }
      { can-read: can-read, can-update: can-update }
    )
    (ok true)
  )
)

(define-public (revoke-document (hash (string-ascii 64)))
  (let ((doc-info (get-document-info hash)))
    (asserts! (is-eq tx-sender (get owner (unwrap! doc-info err-not-found))) err-unauthorized)
    (map-set documents
      { hash: hash }
      (merge (unwrap! doc-info err-not-found)
        { status: "revoked" }
      )
    )
    (ok true)
  )
)

;; Read only functions
(define-read-only (get-document-info (hash (string-ascii 64)))
  (map-get? documents { hash: hash })
)

(define-read-only (check-access (hash (string-ascii 64)) (user principal))
  (default-to 
    { can-read: false, can-update: false }
    (map-get? document-access { hash: hash, user: user })
  )
)
