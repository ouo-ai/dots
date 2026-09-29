import { callDotsBackend, dotsResponse, forgetDotsSession } from "../../_config"

export async function DELETE() {
  const result = await callDotsBackend("/v1/me/data", "DELETE")
  if (result.status >= 400) return dotsResponse(result)
  return forgetDotsSession(dotsResponse(result))
}
