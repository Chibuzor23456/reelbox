import LegalLayout from './LegalLayout'

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" version="1.0">
      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">1. Acceptance of these Terms</h2>
        <p>
          By creating a ReelBox account you agree to these Terms of Service and to the Privacy Policy. If you do
          not agree, do not create an account or use ReelBox.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">2. Eligibility and private access</h2>
        <p>
          ReelBox is a private, invite-only service. Accounts may only be created using a valid invitation issued
          by an administrator. ReelBox is not open to public self-registration.
        </p>
        <p className="mt-2">You must be able to form a binding contract under the laws of your jurisdiction to use ReelBox.</p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">3. Your account</h2>
        <p>
          You are responsible for keeping your password confidential and for all activity that occurs under your
          account. Tell us immediately if you believe your account has been compromised.
        </p>
        <p className="mt-2">
          An administrator may suspend, restrict or delete accounts that violate these Terms, misuse the
          invitation system, or attempt to circumvent the private, invite-only nature of the service.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">4. Prohibited conduct</h2>
        <p>You agree not to:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Share your account or invitation access with anyone not authorized to receive it.</li>
          <li>Attempt to bypass, disable or circumvent DRM, authentication, paywalls or geographic restrictions on any content source.</li>
          <li>Scrape, reverse engineer, or attempt to extract the underlying stream URLs, playlists or source infrastructure that power ReelBox for use outside the application.</li>
          <li>Use ReelBox to redistribute, rebroadcast or publicly perform any content accessed through the service.</li>
          <li>Interfere with or disrupt the operation of ReelBox, its infrastructure, or the third-party sources it connects to.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">5. Third-party content and sources</h2>
        <p>
          ReelBox is an interface that organizes and presents content made available by third-party sources,
          including IPTV-org (live channel listings), Internet Archive (on-demand video), and TMDB (catalogue
          metadata). ReelBox does not host, own or control this content and does not guarantee its availability,
          accuracy, legality in every jurisdiction, or continued existence.
        </p>
        <p className="mt-2">
          Individual channels or titles may become unavailable, geo-restricted, or removed at any time without
          notice, for reasons outside ReelBox's control.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">6. Availability</h2>
        <p>
          ReelBox is provided on an "as available" basis. We do not guarantee uninterrupted or error-free
          operation, and playback of any individual channel or title is not guaranteed.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">7. Intellectual property</h2>
        <p>
          The ReelBox name, logo, and application design are owned by [Your Company Name]. Rights to third-party
          content, channel names, logos and programme information remain with their respective owners, as
          described in the Copyright &amp; Content Policy.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">8. Suspension and termination</h2>
        <p>
          We may suspend or terminate your access to ReelBox at any time, with or without notice, for violation of
          these Terms or for operational, legal or security reasons.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">9. Disclaimer and limitation of liability</h2>
        <p>
          ReelBox is provided without warranties of any kind, to the fullest extent permitted by law. [Your
          Company Name] is not liable for indirect, incidental or consequential damages arising from your use of
          the service, to the fullest extent permitted by law.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">10. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be reflected in a new version
          number, and continued use of ReelBox after that version takes effect constitutes acceptance of the
          updated Terms.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">11. Governing law</h2>
        <p>
          These Terms are governed by the laws of [Governing Law Jurisdiction], without regard to conflict-of-law
          principles. <em>Update this before publishing.</em>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">12. Contact</h2>
        <p>Questions about these Terms can be sent to the address on the Contact / Legal Requests page.</p>
      </section>
    </LegalLayout>
  )
}
