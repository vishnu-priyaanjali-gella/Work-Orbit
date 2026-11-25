import { useState } from 'react';

// Native HTML5 drop target for task cards.
export function useDropZone(onDropTask) {
  const [over, setOver] = useState(null);
  return (key) => ({
    'data-over': over === key || undefined,
    onDragOver: (e) => {
      if (!e.dataTransfer.types.includes('text/task')) return;
      e.preventDefault();
      setOver(key);
    },
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOver(null);
    },
    onDrop: (e) => {
      e.preventDefault();
      setOver(null);
      const id = e.dataTransfer.getData('text/task');
      if (id) onDropTask(id, key);
    },
  });
}
