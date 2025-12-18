export function useStorage(key) {
  function load() {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  function save(value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  return { load, save };
}
