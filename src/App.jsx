import { useState } from 'react';
import TaskBar from './components/TaskBar/TaskBar';
import Desktop from './components/Desktop/Desktop';
import Window from './components/Window/Window';
import './App.css';

function App() {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [nextWindowId, setNextWindowId] = useState(1);

  const openWindow = (appId, appTitle) => {
    const newWindow = {
      id: `window-${nextWindowId}`,
      appId,
      title: appTitle,
      x: 100 + windows.length * 30,
      y: 100 + windows.length * 30,
      width: 800,
      height: 600,
      zIndex: windows.length + 1,
      isMinimized: false,
    };
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextWindowId(prev => prev + 1);
  };

  const closeWindow = windowId => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      const remaining = windows.filter(w => w.id !== windowId);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const activateWindow = windowId => {
    setActiveWindowId(windowId);
    // Поднимаем окно наверх (увеличиваем z-index) и снимаем минимизацию
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex), 0);
      return prev.map(w =>
        w.id === windowId ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
      );
    });
  };

  const updateWindowPosition = (windowId, x, y) => {
    setWindows(prev => prev.map(w => (w.id === windowId ? { ...w, x, y } : w)));
  };

  const maximizeWindow = (windowId, bounds) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== windowId) return w;
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
      })
    );
  };

  const restoreWindow = windowId => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== windowId || !w.prevBounds) return w;
        const { prevBounds } = w;
        return {
          ...w,
          isMaximized: false,
          x: prevBounds.x,
          y: prevBounds.y,
          width: prevBounds.width,
          height: prevBounds.height,
          prevBounds: undefined,
        };
      })
    );
  };

  const minimizeWindow = windowId => {
    setWindows(prev => prev.map(w => (w.id === windowId ? { ...w, isMinimized: true } : w)));
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  };

  return (
    <div className="app">
      <TaskBar windows={windows} activeWindowId={activeWindowId} onWindowClick={activateWindow} />
      <Desktop onOpenApp={openWindow}>
        {windows
          .filter(window => !window.isMinimized)
          .map(window => (
            <Window
              key={window.id}
              id={window.id}
              appId={window.appId}
              title={window.title}
              x={window.x}
              y={window.y}
              width={window.width}
              height={window.height}
              zIndex={window.zIndex}
              isMaximized={window.isMaximized}
              isActive={activeWindowId === window.id}
              onActivate={() => activateWindow(window.id)}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onPositionChange={(x, y) => updateWindowPosition(window.id, x, y)}
              onMaximize={bounds => maximizeWindow(window.id, bounds)}
              onRestore={() => restoreWindow(window.id)}
            />
          ))}
      </Desktop>
    </div>
  );
}

export default App;
