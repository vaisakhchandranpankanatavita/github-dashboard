import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed === '') return
    void navigate(`/user/${trimmed}`)
  }

  return (
    <main className="home">
      <svg
        className="home-icon"
        viewBox="0 0 40 40"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="2" y="4" width="10" height="14" rx="2" />
        <rect x="15" y="4" width="10" height="14" rx="2" />
        <rect x="28" y="4" width="10" height="14" rx="2" />
        <rect x="2" y="22" width="10" height="14" rx="2" />
        <rect x="15" y="22" width="10" height="14" rx="2" />
        <rect x="28" y="22" width="10" height="14" rx="2" />
      </svg>
      <h1 className="home-title">GitHub Dashboard</h1>
      <p className="home-subtitle">Explore public repositories by username</p>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a GitHub username"
          aria-label="GitHub username"
        />
        <button className="search-button" type="submit">Search</button>
      </form>
    </main>
  )
}
