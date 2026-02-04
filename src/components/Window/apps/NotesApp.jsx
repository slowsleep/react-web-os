import { useState } from 'react';
import './NotesApp.css';

export default function NotesApp() {
  const [notes, setNotes] = useState('');

  return (
    <div className="notes-app">
      <textarea
        className="notes-app__textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Введите текст заметки..."
      />
    </div>
  );
}
