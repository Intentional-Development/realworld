import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './App'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreateArticlePage from './pages/CreateArticlePage'
import ViewArticlePage from './pages/ViewArticlePage'
import EditArticlePage from './pages/EditArticlePage'
import FeedPage from './pages/FeedPage'
import YourFeedPage from './pages/YourFeedPage'
import ViewProfilePage from './pages/ViewProfilePage'
import SettingsPage from './pages/SettingsPage'

const router = (
  <BrowserRouter>
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
        <Link to="/register" style={{ marginRight: '1rem' }}>Register</Link>
        <Link to="/editor" style={{ marginRight: '1rem' }}>CreateArticle</Link>
        <Link to="/article/:slug" style={{ marginRight: '1rem' }}>ViewArticle</Link>
        <Link to="/editor/:slug" style={{ marginRight: '1rem' }}>EditArticle</Link>
        <Link to="/" style={{ marginRight: '1rem' }}>Feed</Link>
        <Link to="/" style={{ marginRight: '1rem' }}>YourFeed</Link>
        <Link to="/profile/:username" style={{ marginRight: '1rem' }}>ViewProfile</Link>
        <Link to="/settings" style={{ marginRight: '1rem' }}>Settings</Link>
      </nav>
      <Routes>
        <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/editor" element={<CreateArticlePage />} />
      <Route path="/article/:slug" element={<ViewArticlePage />} />
      <Route path="/editor/:slug" element={<EditArticlePage />} />
      <Route path="/" element={<FeedPage />} />
      <Route path="/" element={<YourFeedPage />} />
      <Route path="/profile/:username" element={<ViewProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {router}
  </React.StrictMode>
)
