import { useEffect, useState } from 'react';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  async function loadNotes() {
    const res = await fetch('/api/notes');
    if (!res.ok) throw new Error('Could not load notes');
    setNotes(await res.json());
  }

  useEffect(() => {
    (async () => {
      try {
        const health = await fetch('/api/health').then((r) => r.json());
        setStatus(health.db === 'ok' ? 'ok' : 'degraded');
        await loadNotes();
      } catch {
        setStatus('unreachable');
      }
    })();
  }, []);

  async function addNote(event) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    setError(null);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: value }),
    });
    if (!res.ok) {
      setError('Could not save the note');
      return;
    }
    setTitle('');
    await loadNotes();
  }

  async function deleteNote(id) {
    setError(null);
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not delete the note');
      return;
    }
    await loadNotes();
  }

  return (
    <main className="page">
      <section className="card">
        <header>
          <h1>Starter App</h1>
          <p className="subtitle">React frontend, Express API and Postgres, all running in Docker.</p>
          <p className={`status status--${status}`} data-testid="status">
            {status === 'ok' && 'API and database connected'}
            {status === 'loading' && 'Checking connection…'}
            {status === 'degraded' && 'API is up, database is not ready'}
            {status === 'unreachable' && 'API is unreachable'}
          </p>
        </header>

        <form className="note-form" onSubmit={addNote}>
          <input
            aria-label="New note"
            placeholder="Write a note…"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button type="submit">Add note</button>
        </form>

        {error && <p className="error">{error}</p>}

        <ul className="notes" data-testid="notes">
          {notes.length === 0 && <li className="empty">No notes yet.</li>}
          {notes.map((note) => (
            <li key={note.id}>
              <span>{note.title}</span>
              <button className="ghost" onClick={() => deleteNote(note.id)} aria-label={`Delete ${note.title}`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
