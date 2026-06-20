import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage.tsx'
import { RepoListPage } from './pages/RepoListPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/user/:username" element={<RepoListPage />} />
    </Routes>
  )
}
