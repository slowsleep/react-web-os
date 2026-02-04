import { useEffect, useState } from 'react';
import { DesktopIcon } from './DesktopIcon';
import Note from '../../assets/icons/note.svg';
import Browser from '../../assets/icons/browser.svg';
import Brush from '../../assets/icons/brush.svg';

const STORAGE_KEY = 'desktop-icons';

const defaultIcons = [
  { id: 'notes', title: 'Заметки', x: 80, y: 80, icon: Note },
  { id: 'browser', title: 'Браузер', x: 80, y: 180, icon: Browser },
  { id: 'paint', title: 'Paint', x: 80, y: 280, icon: Brush },
];

function getInitialIcons() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultIcons;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultIcons;
    // Подставляем сохранённые x, y в дефолтные иконки (чтобы не потерять icon и остальные поля)
    return defaultIcons.map(def => {
      const savedIcon = parsed.find(p => p.id === def.id);
      if (!savedIcon || typeof savedIcon.x !== 'number' || typeof savedIcon.y !== 'number')
        return def;
      return { ...def, x: savedIcon.x, y: savedIcon.y };
    });
  } catch {
    return defaultIcons;
  }
}

export default function Desktop({ children, onOpenApp }) {
  const [icons, setIcons] = useState(getInitialIcons);
  const [selectedIconId, setSelectedIconId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(icons));
  }, [icons]);

  const handleChangePosition = (id, pos) => {
    setIcons(prev => prev.map(icon => (icon.id === id ? { ...icon, ...pos } : icon)));
  };

  const handleSelectIcon = id => {
    setSelectedIconId(id);
  };

  const handleDesktopClick = () => {
    // Сбрасываем выделение при клике на пустое место
    setSelectedIconId(null);
  };

  const handleOpenApp = id => {
    const icon = icons.find(i => i.id === id);
    if (icon) {
      onOpenApp(id, icon.title);
    }
  };

  return (
    <div className="desktop" onClick={handleDesktopClick}>
      {icons.map(icon => (
        <DesktopIcon
          key={icon.id}
          id={icon.id}
          title={icon.title}
          icon={icon.icon}
          x={icon.x}
          y={icon.y}
          isSelected={selectedIconId === icon.id}
          onChangePosition={handleChangePosition}
          onSelect={handleSelectIcon}
          onOpen={handleOpenApp}
        />
      ))}
      {children}
    </div>
  );
}
