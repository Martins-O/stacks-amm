;; Mock Token B - SIP-010 compliant fungible token for testing

(impl-trait .sip-010-trait.sip-010-trait)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u1))
(define-constant ERR_INVALID_AMOUNT (err u2))

(define-fungible-token mock-token-b)

(define-data-var token-name (string-ascii 32) "Mock Token B")
(define-data-var token-symbol (string-ascii 10) "MOCK-B")
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var token-decimals uint u6)

;; Total supply is 1 billion tokens (1,000,000,000 * 10^6 for 6 decimals)
(define-constant TOTAL_SUPPLY u1000000000000000)

;; Initialize the contract by minting all tokens to the deployer
(begin
  (try! (ft-mint? mock-token-b TOTAL_SUPPLY CONTRACT_OWNER))
)

;; SIP-010 Standard Functions

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance mock-token-b who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply mock-token-b))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq from tx-sender) (is-eq from contract-caller)) ERR_NOT_TOKEN_OWNER)
    (ft-transfer? mock-token-b amount from to)
  )
)

;; Mint function (only contract owner)
(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ft-mint? mock-token-b amount to)
  )
)

;; Set token URI (only contract owner)
(define-public (set-token-uri (value (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (var-set token-uri (some value))
    (ok true)
  )
)

;; Transfer ownership (only current owner)
(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok true)
  )
)