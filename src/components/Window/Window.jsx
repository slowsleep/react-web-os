import { useRef, useEffect } from 'react';
import './Window.css';
import NotesApp from './apps/NotesApp';
import BrowserApp from './apps/BrowserApp';
import PaintApp from './apps/PaintApp';

const DRAG_THRESHOLD = 3;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function Window({
  id,
  appId,
  title,
  x,
  y,
  width,
  height,
  zIndex,
  isActive,
  isMaximized = false,
  onActivate,
  onClose,
  onMinimize,
  onPositionChange,
  onMaximize,
  onRestore,
}) {
  const windowRef = useRef(null);
  const headerRef = useRef(null);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false,
  });

  // Обновляем позицию/размер при изменении извне (если не перетаскиваем)
  useEffect(() => {
    if (!dragRef.current.dragging && windowRef.current) {
      windowRef.current.style.left = `${x}px`;
      windowRef.current.style.top = `${y}px`;
      windowRef.current.style.width = `${width}px`;
      windowRef.current.style.height = `${height}px`;
    }
  }, [x, y, width, height]);

  const handleHeaderPointerDown = e => {
    if (e.button !== 0) return;
    if (isMaximized) return; // перетаскивание развёрнутого окна отключено

    e.preventDefault();
    e.stopPropagation();

    // Активируем окно при клике на заголовок
    onActivate();

    const rect = windowRef.current.getBoundingClientRect();

    // Вычисляем offset курсора относительно окна
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;

    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.originX = x;
    dragRef.current.originY = y;
    dragRef.current.hasMoved = false;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = e => {
    if (!dragRef.current.dragging || !windowRef.current) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (!dragRef.current.hasMoved) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
        return;
      }
      dragRef.current.hasMoved = true;
    }

    const desktop = windowRef.current.offsetParent;
    const desktopRect = desktop?.getBoundingClientRect() || { left: 0, top: 0 };
    const desktopW = desktop?.clientWidth ?? 0;
    const desktopH = desktop?.clientHeight ?? 0;
    const winW = windowRef.current.offsetWidth;
    const winH = windowRef.current.offsetHeight;

    let newX = e.clientX - desktopRect.left - dragRef.current.offsetX;
    let newY = e.clientY - desktopRect.top - dragRef.current.offsetY;
    newX = clamp(newX, 0, Math.max(0, desktopW - winW));
    newY = clamp(newY, 0, Math.max(0, desktopH - winH));

    windowRef.current.style.left = `${newX}px`;
    windowRef.current.style.top = `${newY}px`;
  };

  const handlePointerUp = () => {
    if (!dragRef.current.dragging) return;

    dragRef.current.dragging = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    if (dragRef.current.hasMoved && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      const desktopRect = windowRef.current.offsetParent?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      };
      const desktopW = windowRef.current.offsetParent?.clientWidth ?? 0;
      const desktopH = windowRef.current.offsetParent?.clientHeight ?? 0;
      const winW = windowRef.current.offsetWidth;
      const winH = windowRef.current.offsetHeight;
      let newX = rect.left - desktopRect.left;
      let newY = rect.top - desktopRect.top;
      newX = clamp(newX, 0, Math.max(0, desktopW - winW));
      newY = clamp(newY, 0, Math.max(0, desktopH - winH));
      onPositionChange(newX, newY);
    }
  };

  const handleWindowClick = e => {
    e.stopPropagation();
    onActivate();
  };

  const renderAppContent = () => {
    switch (appId) {
      case 'notes':
        return <NotesApp />;
      case 'browser':
        return <BrowserApp />;
      case 'paint':
        return <PaintApp />;
      default:
        return <p>Неизвестное приложение</p>;
    }
  };

  const handleMaximizeToggle = e => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized) {
      onRestore?.();
      return;
    }
    const desktop = windowRef.current?.offsetParent;
    if (!desktop) return;
    const w = desktop.clientWidth;
    const h = desktop.clientHeight;
    onMaximize?.({ x: 0, y: 0, width: w, height: h });
  };

  return (
    <div
      ref={windowRef}
      className={`window ${isActive ? 'window--active' : ''} ${isMaximized ? 'window--maximized' : ''}`}
      style={{
        left: x,
        top: y,
        width,
        height,
        zIndex,
      }}
      onClick={handleWindowClick}
    >
      <div ref={headerRef} className="window__header" onPointerDown={handleHeaderPointerDown}>
        <p className="window__title">{title}</p>
        <div className="window__controls">
          <button
            className="window__button window__button--minimize"
            onClick={e => {
              e.stopPropagation();
              onMinimize();
            }}
            title="Свернуть"
          >
            &#x2212;
          </button>
          <button
            className="window__button window__button--maximize"
            onClick={e => {
              e.stopPropagation();
              handleMaximizeToggle(e);
            }}
            title={isMaximized ? 'Восстановить' : 'Развернуть'}
          >
            {isMaximized ? '❐' : '□'}
          </button>
          <button
            className="window__button window__button--close"
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            title="Закрыть"
          >
            &times;
          </button>
        </div>
      </div>
      <div className="window__content">{renderAppContent()}</div>
    </div>
  );
}
