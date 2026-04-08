// TODO (Week 6): PDF generation endpoint
// See CLAUDE.md — PDF Claim Generator section for full spec.
// Uses @react-pdf/renderer to generate A4 claim PDF per state.

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return new Response(`PDF stub for claim ${params.id} — implement in Week 6`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}
