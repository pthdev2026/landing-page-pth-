"use client";

import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
      className="rounded-full border border-ivory/25 px-5 py-2 text-[length:var(--text-small)] text-ivory transition-colors hover:border-ivory/55"
    >
      Se déconnecter
    </button>
  );
}
