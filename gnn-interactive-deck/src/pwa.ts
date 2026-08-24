export function registerOfflineApp() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("./sw.js", document.baseURI);

    navigator.serviceWorker
      .register(serviceWorkerUrl, { scope: "./" })
      .then(async (registration) => {
        try {
          await registration.update();
        } catch {
          // An already-installed worker remains valid when the network is unavailable.
        }

        const pendingWorker = registration.installing || registration.waiting;
        if (pendingWorker) {
          pendingWorker.postMessage({ type: "SKIP_WAITING" });
          await waitForActivation(pendingWorker);
        }

        await navigator.serviceWorker.ready;
        const activeWorker = registration.active;
        await waitForController(activeWorker);
        document.documentElement.dataset.offlineReady =
          activeWorker && navigator.serviceWorker.controller === activeWorker ? "true" : "false";
      })
      .catch((error) => {
        document.documentElement.dataset.offlineReady = "false";
        console.warn("Offline presentation support could not be registered.", error);
      });
  });
}

function waitForActivation(worker: ServiceWorker) {
  if (worker.state === "activated" || worker.state === "redundant") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const handleStateChange = () => {
      if (worker.state === "activated" || worker.state === "redundant") {
        worker.removeEventListener("statechange", handleStateChange);
        resolve();
      }
    };

    worker.addEventListener("statechange", handleStateChange);
  });
}

function waitForController(activeWorker: ServiceWorker | null) {
  if (activeWorker && navigator.serviceWorker.controller === activeWorker) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const handleControllerChange = () => {
      if (!activeWorker || navigator.serviceWorker.controller !== activeWorker) {
        return;
      }

      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      window.clearTimeout(timeout);
      resolve();
    };
    const timeout = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      resolve();
    }, 10000);

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
  });
}
