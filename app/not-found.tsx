export default function NotFound() {
  return (
    <main style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h2>404 - 找不到頁面</h2>
      <p>抱歉，您所尋找的測驗頁面不存在。</p>
      <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>返回測驗首頁</a>
    </main>
  );
}
