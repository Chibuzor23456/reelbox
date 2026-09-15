import LegalLayout from './LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" version="1.0">
      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">What we collect</h2>
        <p>When you accept an invitation and use ReelBox, we may collect:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Account information: name, email address, and a securely hashed password (we never store your password in plain text).</li>
          <li>Optional profile information: display name and profile image, where provided.</li>
          <li>Usage data: favorites, watch history, resume positions for on-demand video, and search activity within the app.</li>
          <li>Device and session data: session identifiers, sign-in timestamps, IP address and browser/device information associated with your sessions, so suspicious activity can be detected and sessions can be revoked.</li>
          <li>Preferences: personalization signals such as preferred categories, countries and languages, used to power recommendations.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">How we use it</h2>
        <p>We use this information to:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Authenticate you and keep your account secure.</li>
          <li>Sync your favorites, history and preferences across your devices.</li>
          <li>Personalize recommendations and content discovery.</li>
          <li>Maintain the security and integrity of the service, including detecting abuse of the invitation system.</li>
          <li>Respond to support and legal requests.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">What we don't do</h2>
        <p>
          ReelBox does not sell your personal information. We do not run advertising, and we do not share your
          account data with third parties for their own marketing purposes.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Third-party sources</h2>
        <p>
          ReelBox's catalogue is built from third-party sources — IPTV-org for live channel listings, Internet
          Archive for on-demand video, and TMDB for supplementary metadata such as posters and synopses. When you
          play a channel or title, your browser may connect directly to that source's servers to retrieve the
          video, independently of ReelBox. Those sources' own privacy practices are not covered by this policy.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Retention</h2>
        <p>
          We retain account and usage data for as long as your account is active, and for a limited period
          afterward as needed for security, legal or operational reasons.{' '}
          <em>Specify exact retention periods before publishing.</em>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Security</h2>
        <p>
          We use industry-standard practices to protect your data, including hashed passwords, database-backed
          sessions that can be individually revoked, and prepared-statement database access to prevent injection
          attacks. No method of storage or transmission is completely secure, and we cannot guarantee absolute
          security.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Your rights</h2>
        <p>
          You can review and update certain account information from your Profile. To request a copy of your
          data, or to request deletion of your account and associated data, contact us using the details on the
          Contact / Legal Requests page.{' '}
          <em>Confirm the applicable legal basis and response timeframe for your jurisdiction (e.g. GDPR, CCPA) before publishing.</em>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Cookies</h2>
        <p>ReelBox uses essential cookies required for sign-in and security. See the Cookie Policy for details.</p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Changes to this policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected in a new version number.</p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Contact</h2>
        <p>Questions about this policy can be sent to the address on the Contact / Legal Requests page.</p>
      </section>
    </LegalLayout>
  )
}
