import { useState, useMemo, useEffect, useRef } from 'react';
import './BrowserApp.css';

export default function BrowserApp() {
  const [url, setUrl] = useState('https://wikipedia.com');
  const [history, setHistory] = useState(['https://wikipedia.com']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const iframeRef = useRef(null);

  const currentUrl = useMemo(
    () => history[currentIndex] ?? 'https://wikipedia.com',
    [history, currentIndex]
  );

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  const handleNavigate = e => {
    e.preventDefault();
    if (!url) return;

    setHistory(prev => {
      const current = prev[currentIndex];

      if (current === url) return prev;

      // отрезаем "вперёд", если мы были не в конце истории
      const trimmed = prev.slice(0, currentIndex + 1);
      const nextHistory = [...trimmed, url];
      setCurrentIndex(nextHistory.length - 1);
      return nextHistory;
    });
  };

  const handleBack = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleForward = () => {
    if (currentIndex >= history.length - 1) return;
    setCurrentIndex(prev => Math.min(history.length - 1, prev + 1));
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  return (
    <div className="browser-app">
      <div className="browser-app__toolbar">
        <button
          className="browser-app__button"
          onClick={handleBack}
          title="Назад"
          disabled={currentIndex <= 0}
        >
          ←
        </button>
        <button
          className="browser-app__button"
          onClick={handleForward}
          title="Вперёд"
          disabled={currentIndex >= history.length - 1}
        >
          →
        </button>
        <button className="browser-app__button" onClick={handleReload} title="Обновить">
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
        <p
          className="browser-app__info"
          title="Кнопки назад, вперед и обновить работают только для поисковой строки, но не для iframe ниже."
        >
          ⓘ
        </p>
      </div>
      <div className="browser-app__content">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="browser-app__iframe"
          title="Browser Content"
        />
      </div>
    </div>
  );
}
