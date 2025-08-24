export default function HealthBanner({ kind="info", message }) {
  const styles = {
    base: "padding:10px;border-radius:8px;margin:12px 0;font:14px/1.4 system-ui;",
    info: "background:#eef5ff;border:1px solid #cfe1ff;color:#0b3d91;",
    warn: "background:#fff8e6;border:1px solid #ffde8a;color:#8a5a00;",
    err:  "background:#ffecec;border:1px solid #ffb3b3;color:#7a0000;",
  };
  return (
    <div style={{cssText: styles.base + styles[kind]}}>
      {message}
    </div>
  );
}
