import PlaceholderPage from '../components/PlaceholderPage'
import RequireAuth from '../components/RequireAuth'

export default function Profile() {
  return (
    <RequireAuth title="Profile">
      <PlaceholderPage title="Profile" description="Account details and preferences land here in Phase 6." />
    </RequireAuth>
  )
}
