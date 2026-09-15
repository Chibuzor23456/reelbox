import { Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ScrollToTop from './components/ScrollToTop'
import AcceptInvite from './pages/AcceptInvite'
import Africa from './pages/Africa'
import AdminAuditLog from './pages/admin/AuditLog'
import AdminChannels from './pages/admin/Channels'
import AdminDashboard from './pages/admin/Dashboard'
import AdminInvitations from './pages/admin/Invitations'
import AdminLayout from './pages/admin/AdminLayout'
import AdminRoute from './pages/admin/AdminRoute'
import AdminUsers from './pages/admin/Users'
import AdminVod from './pages/admin/Vod'
import Browse from './pages/Browse'
import Home from './pages/Home'
import AcceptableUse from './pages/legal/AcceptableUse'
import Contact from './pages/legal/Contact'
import Cookies from './pages/legal/Cookies'
import Copyright from './pages/legal/Copyright'
import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import LiveTV from './pages/LiveTV'
import MovieDetail from './pages/MovieDetail'
import Movies from './pages/Movies'
import MyList from './pages/MyList'
import News from './pages/News'
import Nigeria from './pages/Nigeria'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Series from './pages/Series'
import SeriesDetail from './pages/SeriesDetail'
import Sports from './pages/Sports'
import TvGuide from './pages/TvGuide'

function ConsumerLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

function AdminSection() {
  return (
    <AdminRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminRoute>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<ConsumerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveTV />} />
          <Route path="/guide" element={<TvGuide />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/series" element={<Series />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/news" element={<News />} />
          <Route path="/nigeria" element={<Nigeria />} />
          <Route path="/africa" element={<Africa />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/cookies" element={<Cookies />} />
          <Route path="/legal/copyright" element={<Copyright />} />
          <Route path="/legal/acceptable-use" element={<AcceptableUse />} />
          <Route path="/legal/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/accept-invite" element={<AcceptInvite />} />

        <Route element={<AdminSection />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/invitations" element={<AdminInvitations />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/channels" element={<AdminChannels />} />
          <Route path="/admin/vod" element={<AdminVod />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
        </Route>
      </Routes>
    </>
  )
}
