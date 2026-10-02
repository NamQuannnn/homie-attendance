"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AppData } from "@/types";
import { repository } from "@/lib/storage";
import { errorMessage } from "./shared";
const empty: AppData = { employees: [], absences: [], settings: [] };
export function useAttendanceData() {
  const [data, setData] = useState<AppData>(empty);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const alive = useRef(false);
  const busy = useRef(false);
  const refreshing = useRef(false);
  const version = useRef(0);
  const refresh = useCallback(async () => {
    if (busy.current || refreshing.current) return;
    const current = version.current;
    refreshing.current = true;
    if (alive.current) setLoading(true);
    try {
      const next = await repository.load();
      if (alive.current && current === version.current) {
        setData(next);
        setReady(true);
        setError("");
      }
    } catch (cause) {
      if (alive.current && current === version.current)
        setError(errorMessage(cause));
    } finally {
      refreshing.current = false;
      if (alive.current) setLoading(false);
    }
  }, []);
  const invalidate = useCallback(() => {
    version.current++;
  }, []);
  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });
    const onFocus = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = setInterval(onFocus, 30000);
    return () => {
      cancelled = true;
      alive.current = false;
      invalidate();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      clearInterval(timer);
    };
  }, [refresh, invalidate]);
  async function mutate<T>(
    action: () => Promise<T>,
    apply: (previous: AppData, result: T) => AppData,
  ): Promise<string> {
    if (busy.current) return "Đang lưu. Vui lòng chờ.";
    busy.current = true;
    version.current++;
    setSaving(true);
    try {
      const result = await action();
      if (alive.current) {
        setData((previous) => apply(previous, result));
        setError("");
      }
      return "";
    } catch (cause) {
      const message = errorMessage(cause);
      if (alive.current) setError(message);
      return message;
    } finally {
      busy.current = false;
      if (alive.current) setSaving(false);
    }
  }
  return { data, ready, error, saving, loading, refresh, mutate };
}
