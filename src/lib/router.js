import { useEffect, useState } from 'react';

const read = () => window.location.hash.slice(1) || '/';
export const navigate = (path) => { window.location.hash = path; };

// Minimal hash router: works on any static host and from a plain file.
export function useRoute() {
  const [path, setPath] = useState(read);
  useEffect(() => {
    const onChange = () => { setPath(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}
