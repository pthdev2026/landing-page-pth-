"use client";

import { useEffect, useRef } from "react";

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return loading;
}

/**
 * Cloudflare Turnstile en mode « interaction-only » : invisible pour la quasi-totalité des visiteurs
 * (un défi n'apparaît que si le navigateur paraît suspect). Ne fait rien sans `siteKey`.
 * `onToken(token)` reçoit le jeton (ou "" s'il expire / échoue) ; changer `resetKey` redemande un jeton neuf.
 */
export default function Turnstile({ siteKey, onToken, resetKey = 0 }) {
  const box = useRef(null);
  const widget = useRef(null);
  const callback = useRef(onToken);
  useEffect(() => {
    callback.current = onToken; // toujours le dernier gestionnaire, sans relancer le widget
  });

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          theme: "dark",
          language: "fr",
          appearance: "interaction-only",
          callback: (token) => callback.current(token),
          "expired-callback": () => callback.current(""),
          "error-callback": () => callback.current(""),
        });
      })
      .catch(() => callback.current(""));
    return () => {
      cancelled = true;
      if (widget.current != null && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetKey && widget.current != null && window.turnstile) window.turnstile.reset(widget.current);
  }, [resetKey]);

  if (!siteKey) return null;
  return <div ref={box} className="flex justify-center sm:col-span-2" />;
}
