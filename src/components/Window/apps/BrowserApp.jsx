import { useState } from 'react';
import './BrowserApp.css';

// TODO: добавить обработку кнопок управления
export default function BrowserApp() {
  const [url, setUrl] = useState('https://wikipedia.com');
  const [currentUrl, setCurrentUrl] = useState('https://wikipedia.com');

  const handleNavigate = e => {
    e.preventDefault();
    setCurrentUrl(url);
  };

  return (
    <div className="browser-app">
      <div className="browser-app__toolbar">
        <button
          className="browser-app__button"
          onClick={() => setCurrentUrl(currentUrl)}
          title="Назад"
        >
          ←
        </button>
        <button
          className="browser-app__button"
          onClick={() => setCurrentUrl(currentUrl)}
          title="Вперёд"
        >
          →
        </button>
        <button
          className="browser-app__button"
          onClick={() => setCurrentUrl(currentUrl)}
          title="Обновить"
        >
          ↻
        </button>
        <form className="browser-app__url-bar" onSubmit={handleNavigate}>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="browser-app__url-input"
            placeholder="Введите URL..."
          />
          <button type="submit" className="browser-app__go-button">
            Перейти
          </button>
        </form>
      </div>
      <div className="browser-app__content">
        <iframe src={currentUrl} className="browser-app__iframe" title="Browser Content" />
      </div>
    </div>
  );
}
