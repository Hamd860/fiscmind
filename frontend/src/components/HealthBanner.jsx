export default function HealthBanner({ kind = "info", message = "" }) {
  const map = {
    info:  { ring:"ring-blue-200",   bg:"bg-blue-50",   text:"text-blue-700",  icon:"ℹ️" },
    warn:  { ring:"ring-amber-200",  bg:"bg-amber-50",  text:"text-amber-800", icon:"⚠️" },
    ok:    { ring:"ring-emerald-200",bg:"bg-emerald-50",text:"text-emerald-700",icon:"✅" },
    error: { ring:"ring-rose-200",   bg:"bg-rose-50",   text:"text-rose-700",  icon:"⛔" },
  }[kind] || {};
  return (
    <div className={`mx-auto my-4 max-w-5xl rounded-xl ring-1 ${map.ring} ${map.bg} ${map.text} px-3 py-2`}>
      <div className="flex items-center gap-2 text-sm">
        <span aria-hidden>{map.icon}</span>
        <p className="truncate">{message}</p>
      </div>
    </div>
  );
}
