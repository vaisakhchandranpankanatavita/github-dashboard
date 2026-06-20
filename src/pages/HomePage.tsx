import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed === '') return
    void navigate(`/user/${trimmed}`)
  }

  return (
    <main>
      <h1 ref={headingRef} tabIndex={-1}>GitHub Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a GitHub username"
          aria-label="GitHub username"
          autoFocus
        />
        <button type="submit">Search</button>
      </form>
    </main>
  )
}
