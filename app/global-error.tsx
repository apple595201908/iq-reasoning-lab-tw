"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-Hant-TW">
      <body style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <h2>系統發生暫時性問題</h2>
        <p>測驗載入過程中遇到非預期狀況，請嘗試重新整理或重試。</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{ padding: "0.5rem 1rem", marginTop: "1rem", cursor: "pointer" }}
        >
          重新嘗試
        </button>
      </body>
    </html>
  );
}
