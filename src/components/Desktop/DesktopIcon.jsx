import { useRef, useEffect } from 'react';
import './DesktopIcon.css';
import FileFill from '../../assets/icons/file-earmark-fill.svg';

export function DesktopIcon({
  id,
  title,
  icon = null,
  x,
  y,
  isSelected = false,
  onChangePosition,
  onSelect,
  onOpen,
}) {
  const iconRef = useRef(null);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false,
    currentX: 0,
    currentY: 0,
  });

  const DRAG_THRESHOLD = 3; // пикселей до начала реального перетаскивания

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // Сбрасываем позицию при изменении x, y извне (если не перетаскиваем)
  useEffect(() => {
    if (!dragRef.current.dragging && iconRef.current) {
      iconRef.current.style.left = `${x}px`;
      iconRef.current.style.top = `${y}px`;
    }
  }, [x, y]);

  const handlePointerDown = e => {
    if (e.button !== 0) return; // реагируем только на левую кнопку

    e.preventDefault();
    e.stopPropagation(); // предотвращаем всплытие на Desktop

    // один клик — выделяем иконку
    onSelect?.(id);

    // Вычисляем offset курсора относительно иконки
    const rect = iconRef.current.getBoundingClientRect();
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;

    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.originX = x;
    dragRef.current.originY = y;
    dragRef.current.hasMoved = false;
    dragRef.current.currentX = x;
    dragRef.current.currentY = y;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = e => {
    if (!dragRef.current.dragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // если движение меньше порога — считаем, что это клик, а не drag
    if (!dragRef.current.hasMoved) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
        return;
      }
      dragRef.current.hasMoved = true;
    }

    // Вычисляем новую позицию с учетом offset курсора и границ рабочего стола
    const desktop = iconRef.current.offsetParent;
    const desktopRect = desktop?.getBoundingClientRect() || { left: 0, top: 0 };
    const desktopW = desktop?.clientWidth ?? 0;
    const desktopH = desktop?.clientHeight ?? 0;
    const iconW = iconRef.current?.offsetWidth ?? 64;
    const iconH = iconRef.current?.offsetHeight ?? 80;

    let newX = e.clientX - desktopRect.left - dragRef.current.offsetX;
    let newY = e.clientY - desktopRect.top - dragRef.current.offsetY;
    newX = clamp(newX, 0, Math.max(0, desktopW - iconW));
    newY = clamp(newY, 0, Math.max(0, desktopH - iconH));

    dragRef.current.currentX = newX;
    dragRef.current.currentY = newY;

    if (iconRef.current) {
      iconRef.current.style.left = `${newX}px`;
      iconRef.current.style.top = `${newY}px`;
    }
  };

  const handlePointerUp = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    // если иконку реально перетаскивали — сохраняем новую позицию (уже в границах)
    if (dragRef.current.hasMoved) {
      onChangePosition?.(id, {
        x: dragRef.current.currentX,
        y: dragRef.current.currentY,
      });
    }
  };

  const handleDoubleClick = () => {
    onOpen?.(id);
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon${isSelected ? ' desktop-icon--selected' : ''}`}
      style={{
        left: x,
        top: y,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onClick={e => e.stopPropagation()}
    >
      <div className="desktop-icon__icon">
        <img className="desktop-icon__icon__img" src={icon ?? FileFill} alt="icon" />
      </div>
      <div className="desktop-icon__label">{title}</div>
    </div>
  );
}
