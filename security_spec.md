# Security Spec - Studio X

## Data Invariants
- A Client must have a name, phone, and ownerId.
- A Transaction must belong to a Client and an ownerId.
- Users can only read/write their own data (ownerId == request.auth.uid).
- phone numbers should be validated for size.

## The Dirty Dozen Payloads (Target: DENY)
1. Create client with someone else's ownerId.
2. Read all clients (unfiltered list).
3. Update client name without being the owner.
4. Delete a transaction belonging to another user.
5. Create transaction with negative amount.
6. Create transaction with 1MB description (Denial of Wallet).
7. Create client with non-string phone.
8. Create transaction with invalid payment method.
9. Update transaction ownerId (Privilege escalation).
10. Update createdAt (Immutability).
11. Create transaction for non-existent client.
12. Read client PII (phone) without being owner.
