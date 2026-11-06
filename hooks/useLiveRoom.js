"use client";
import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket-client";

/**
 * Socket room join karo aur events suno. Socket band ho ya na mile to
 * `fallbackMs` ke interval par onEvent("poll") chalta hai, taaki data phir bhi live rahe.
 * Room me sirf "kuch badla" signal aata hai; asli data component authenticated API se laata hai.
 */
export default function useLiveRoom(room, events, onEvent, fallbackMs = 20000) {
  const cb = useRef(onEvent);
  cb.current = onEvent;
  const key = events.join(",");

  useEffect(() => {
    if (!room) return;
    const s = getSocket();
    const join = () => s.emit("join-room", room);
    const handlers = key.split(",").map((ev) => [ev, (payload) => cb.current?.(ev, payload)]);

    s.on("connect", join);
    handlers.forEach(([ev, h]) => s.on(ev, h));
    if (s.connected) join();
    else s.connect();

    const t = setInterval(() => cb.current?.("poll"), fallbackMs);
    return () => {
      clearInterval(t);
      s.off("connect", join);
      handlers.forEach(([ev, h]) => s.off(ev, h));
    };
  }, [room, key, fallbackMs]);
}
