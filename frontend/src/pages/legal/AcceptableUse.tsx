import { Link } from 'react-router-dom'
import LegalLayout from './LegalLayout'

export default function AcceptableUse() {
  return (
    <LegalLayout title="Acceptable Use Policy" version="1.0">
      <p>
        This Acceptable Use Policy supplements the{' '}
        <Link to="/legal/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Prohibited uses</h2>
        <p>In addition to the restrictions in the Terms of Service, you agree not to:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Attempt to gain unauthorized access to ReelBox's systems, other users' accounts, or the administrative portal.</li>
          <li>Use automated tools to scrape, index or bulk-download ReelBox's catalogue, metadata or stream references.</li>
          <li>Attempt to circumvent invite-only access, including by creating or trading invitations outside of what an administrator has authorized.</li>
          <li>Use ReelBox in any way that violates applicable law, including copyright law in your jurisdiction.</li>
          <li>Introduce malware, attempt denial-of-service attacks, or otherwise interfere with ReelBox's infrastructure or the third-party sources it connects to.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Enforcement</h2>
        <p>
          Violating this policy may result in suspension or termination of your account, in addition to any other
          remedies available under the Terms of Service.
        </p>
      </section>
    </LegalLayout>
  )
}
