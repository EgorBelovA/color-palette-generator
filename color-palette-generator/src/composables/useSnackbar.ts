import { ref } from 'vue';

interface SnackbarMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number;
}

const messages = ref<SnackbarMessage[]>([]);

export function useSnackbar() {
  function add(message: Omit<SnackbarMessage, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const snackbar: SnackbarMessage = { id, ...message };

    messages.value.push(snackbar);

    if (snackbar.timeout) {
      setTimeout(() => remove(id), snackbar.timeout);
    }

    return id;
  }

  function remove(id: string) {
    messages.value = messages.value.filter((msg) => msg.id !== id);
  }

  function success(text: string, timeout = 3000) {
    return add({ text, type: 'success', timeout });
  }

  function error(text: string, timeout = 5000) {
    return add({ text, type: 'error', timeout });
  }

  return {
    messages,
    add,
    remove,
    success,
    error,
    info: (text: string, timeout = 3000) =>
      add({ text, type: 'info', timeout }),
    warning: (text: string, timeout = 4000) =>
      add({ text, type: 'warning', timeout }),
  };
}
