import LegalLayout from './LegalLayout'

export default function Copyright() {
  return (
    <LegalLayout title="Copyright & Content Policy" version="1.0">
      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">What ReelBox is</h2>
        <p>
          ReelBox is a private interface for organizing and accessing content made available by third-party
          sources. It is not a content owner or broadcaster, and it does not claim ownership of the channel
          names, logos, programme information, stream links, video files or metadata it displays.
        </p>
        <ul className="mt-2 list-disc pl-5">
          <li>Live channel listings are sourced from IPTV-org, an open directory of publicly available IPTV stream references.</li>
          <li>On-demand movies and series are sourced from Internet Archive, limited to content believed to be in the public domain or otherwise legally available for this use.</li>
          <li>Supplementary catalogue metadata (posters, synopses, cast information) may be sourced from TMDB.</li>
        </ul>
        <p className="mt-2">
          Rights to all such material remain with their respective owners and licensors. ReelBox does not modify,
          rebroadcast or claim ownership of third-party content.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">What ReelBox does not do</h2>
        <ul className="list-disc pl-5">
          <li>ReelBox does not circumvent DRM, authentication, paywalls or geographic restrictions on any content source.</li>
          <li>ReelBox does not knowingly source unauthorized copies of copyrighted movies or series.</li>
          <li>ReelBox does not guarantee that any channel or title will remain available — third-party sources can change or disappear at any time.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Takedown and legal requests</h2>
        <p>
          If you are a rights holder and believe content accessible through ReelBox infringes your rights, or you
          have another legal concern about content shown in the app, contact us using the details on the Contact
          / Legal Requests page. Include enough detail to identify the specific content and your basis for the
          request, and we will review it.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-text">Scope boundary</h2>
        <p>
          ReelBox is not affiliated with, endorsed by, or a substitute for any specific streaming platform.
          References to any third-party trademark are for identification purposes only.
        </p>
      </section>
    </LegalLayout>
  )
}
