interface DeletedAccountStateActions {
  setPrincipalId: (principalId: string) => void
  setPassword: (password: string) => void
  setEd25519Signer: (signer: null) => void
  setSession: (session: null) => void
  setEmail?: (email: string) => void
}

export function resetSharedAccountStateAfterDeletion({
  setPrincipalId,
  setPassword,
  setEd25519Signer,
  setSession,
}: DeletedAccountStateActions) {
  setPrincipalId("")
  setPassword("")
  setEd25519Signer(null)
  setSession(null)
}
