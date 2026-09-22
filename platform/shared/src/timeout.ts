export function requestTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException("The operation timed out.", "TimeoutError"));
  }, ms);
  return {
    signal: controller.signal,
    cancel() {
      clearTimeout(timer);
    },
  };
}
