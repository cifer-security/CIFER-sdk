import { describe, expect, it, vi } from "vitest"
import { resetSharedAccountStateAfterDeletion } from "../examples/web2-integration/lib/account-deletion-state"

describe("resetSharedAccountStateAfterDeletion", () => {
  it("clears stale account credentials while preserving the email for reactivation", () => {
    const actions = {
      setPrincipalId: vi.fn(),
      setPassword: vi.fn(),
      setEd25519Signer: vi.fn(),
      setSession: vi.fn(),
      setEmail: vi.fn(),
    }

    resetSharedAccountStateAfterDeletion(actions)

    expect(actions.setPrincipalId).toHaveBeenCalledTimes(1)
    expect(actions.setPrincipalId).toHaveBeenCalledWith("")
    expect(actions.setPassword).toHaveBeenCalledTimes(1)
    expect(actions.setPassword).toHaveBeenCalledWith("")
    expect(actions.setEd25519Signer).toHaveBeenCalledTimes(1)
    expect(actions.setEd25519Signer).toHaveBeenCalledWith(null)
    expect(actions.setSession).toHaveBeenCalledTimes(1)
    expect(actions.setSession).toHaveBeenCalledWith(null)
    expect(actions.setEmail).not.toHaveBeenCalled()
  })
})
