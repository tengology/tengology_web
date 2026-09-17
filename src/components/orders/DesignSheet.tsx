import { beadPickList, readDesignSnapshot } from "@/lib/design-snapshot";

/** Read-only order snapshot, never a link to an editable draft. */
export function DesignSheet({ snapshot, quantity = 1 }: { snapshot?: string | null; quantity?: number }) {
  const d = readDesignSnapshot(snapshot);
  if (!d) return null;
  return <section className="my-4 space-y-4 rounded border p-4 print:break-before-page">
    <h3 className="font-medium">DIY bracelet — making & picking sheet</h3>
    <p className="text-sm">{quantity} bracelet(s) · Wrist {d.wristMm} mm · Elastic band · {d.beads.length} beads per bracelet</p>
    <p className="text-xs text-muted-foreground">Estimated inner circumference: {d.innerMm} mm. Check fit before making. Reference colours vary naturally; selected image variants are visual references, not reserved individual beads.</p>
    <svg viewBox="0 0 360 360" role="img" aria-label="Ordered bracelet design, numbered clockwise from the top" className="mx-auto w-full max-w-sm">
      <circle cx="180" cy="180" r="125" fill="none" stroke="#d6d3d1" />
      {d.beads.map((b, i) => {
        const a = 2 * Math.PI * i / d.beads.length - Math.PI / 2;
        const x = 180 + 125 * Math.cos(a), y = 180 + 125 * Math.sin(a);
        const size = Math.min(32, 620 / d.beads.length);
        return <g key={b.position}><circle cx={x} cy={y} r={size / 2} fill={b.hex} /><image href={b.image} x={x - size / 2} y={y - size / 2} width={size} height={size} /><text x={180 + 153 * Math.cos(a)} y={184 + 153 * Math.sin(a)} textAnchor="middle" fontSize="10" fill="#292524">{b.position}</text></g>;
      })}
      <text x="180" y="174" textAnchor="middle" fontSize="14">Wrist {d.wristMm} mm</text>
      <text x="180" y="196" textAnchor="middle" fontSize="11">Sequence reference · not to scale</text>
    </svg>
    <h4 className="text-sm font-medium">Beads to pick — totals for {quantity} bracelet(s)</h4>
    <table className="w-full text-left text-sm"><thead><tr className="border-b"><th>Check</th><th>Bead / colour</th><th>Size</th><th>Qty</th></tr></thead><tbody>{beadPickList(d, quantity).map(b => <tr key={`${b.slug}-${b.sizeMm}`} className="border-b"><td>☐</td><td className="py-2">{b.name} · {b.color}<br /><small>{b.slug}</small></td><td>{b.sizeMm} mm</td><td>{b.count}</td></tr>)}</tbody></table>
    <h4 className="text-sm font-medium">Stringing order — one bracelet, clockwise from bead 1</h4>
    <ol className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">{d.beads.map(b => <li key={b.position} className="flex items-center gap-2 rounded border p-2 print:break-inside-avoid">
      {/* Persisted catalogue images; plain img also works in print. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={b.image} alt={b.name} width={28} height={28} className="object-contain" />
      <span><strong>{b.position}.</strong> {b.name}<br />{b.sizeMm} mm · reference {b.variant}</span>
    </li>)}</ol>
    <p className="text-sm">☐ Beads picked &nbsp; ☐ Size checked &nbsp; ☐ Strung in order &nbsp; ☐ Quality checked</p>
  </section>;
}
