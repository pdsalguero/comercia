"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScrollToBottom({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const el = document.getElementById("msg-scroll");
    if (el) el.scrollTop = el.scrollHeight;
    // Refresh the layout so the sidebar badge clears after marking messages as read
    if (hasUnread) router.refresh();
  }, []);

  return null;
}
