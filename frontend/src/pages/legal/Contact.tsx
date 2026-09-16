import LegalLayout from './LegalLayout'

export default function Contact() {
  return (
    <LegalLayout title="Contact & Legal Requests" version="1.0">
      <p>
        For questions about these policies, to exercise your privacy rights, to submit a copyright or takedown
        request, or for any other legal matter concerning ReelBox, contact:
      </p>

      <p className="rounded-md border border-border bg-card px-4 py-3 font-mono text-sm">hi@okwudilicanice.com</p>

      <p>
        Please include enough detail for us to identify and respond to your request — for copyright/takedown
        requests, this means identifying the specific content and your basis for the request.
      </p>
    </LegalLayout>
  )
}
