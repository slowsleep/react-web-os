import { useMemo, useState, useEffect } from 'react';
import YinYang from '../../assets/icons/yin-yang.svg';
import './TaskBar.css';

const convertTime = dateTime => {
  const week = ['Вс.', 'Пн.', 'Вт.', 'Ср.', 'Чт.', 'Пт.', 'Сб.'];
  const dayOfWeek = week[dateTime.getDay()];
  const day = dateTime.getDate();
  const months = [
    'янв.',
    'февр.',
    'март.',
    'апр.',
    'мая',
    'июн.',
    'июл.',
    'авг.',
    'сент.',
    'окт.',
    'нояб.',
    'дек.',
  ];
  const month = months[dateTime.getMonth()];
  const hour = dateTime.getHours().toString().padStart(2, '0');
  const minutes = dateTime.getMinutes().toString().padStart(2, '0');
  const seconds = dateTime.getSeconds().toString().padStart(2, '0');

  return `${dayOfWeek} ${day} ${month} ${hour}:${minutes}:${seconds}`;
};

function TaskBar({ windows = [], activeWindowId, onWindowClick }) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const getConvertTime = useMemo(() => {
    return convertTime(dateTime);
  }, [dateTime]);

  return (
    <div className="taskbar">
      <div className="taskbar-left">
        <img className="taskbar-start" src={YinYang} />
        <div className="taskbar-openapps">
          {windows.length === 0 ? (
            <p>Нет открытых приложений</p>
          ) : (
            windows.map(window => (
              <button
                key={window.id}
                className={`taskbar-openapps__item ${
                  activeWindowId === window.id ? 'taskbar-openapps__item--active' : ''
                }`}
                onClick={() => onWindowClick(window.id)}
              >
                {window.title}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="taskbar-right">
        <p className="taskbar-time">{getConvertTime}</p>
      </div>
    </div>
  );
}

export default TaskBar;
