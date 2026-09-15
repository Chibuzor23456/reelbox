import LegalLayout from './LegalLayout'

export default function Cookies() {
  return (
    <LegalLayout title="Cookie Policy" version="1.0">
      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">What cookies ReelBox uses</h2>
        <p>ReelBox uses a small number of cookies required for the application to function:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>
            A session cookie that keeps you signed in and identifies your session to our server. This cookie is
            essential — without it, ReelBox cannot know you're signed in.
          </li>
        </ul>
        <p className="mt-2">
          We do not currently use advertising cookies, third-party tracking cookies, or analytics cookies. If
          that changes in the future, this policy will be updated and, where required, we will ask for your
          consent first.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Managing cookies</h2>
        <p>
          Because ReelBox's only cookie is essential for signing in, disabling cookies in your browser will
          prevent you from staying signed in to the service.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Changes to this policy</h2>
        <p>We may update this Cookie Policy if the cookies ReelBox uses change. Check back periodically for updates.</p>
      </section>
    </LegalLayout>
  )
}
