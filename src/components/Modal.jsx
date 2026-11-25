import { useEffect, useRef } from 'react';

// Uses the native <dialog>, which handles focus trapping and the Escape key.
export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }} aria-label={title}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="icon" onClick={onClose} aria-label="Close">×</button>
      </div>
      {children}
    </dialog>
  );
}
