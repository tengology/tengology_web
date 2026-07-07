"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShippingZone {
  id: string;
  name: string;
  baseRate: number;
  freeThreshold: number | null;
}

interface ZoneDraft {
  name: string;
  baseRate: string;
  freeThreshold: string;
}

export function ShippingZonesForm({ zones }: { zones: ShippingZone[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, ZoneDraft>>(() =>
    Object.fromEntries(
      zones.map((zone) => [
        zone.id,
        {
          name: zone.name,
          baseRate: String(zone.baseRate),
          freeThreshold:
            zone.freeThreshold != null ? String(zone.freeThreshold) : "",
        },
      ])
    )
  );
  const [saving, setSaving] = useState<string | null>(null);

  const updateDraft = (id: string, field: keyof ZoneDraft, value: string) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleSave = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    const name = draft.name.trim();
    const baseRate = parseFloat(draft.baseRate);
    const freeThreshold =
      draft.freeThreshold.trim() === "" ? null : parseFloat(draft.freeThreshold);

    if (!name) {
      toast.error("Zone name is required.");
      return;
    }
    if (isNaN(baseRate) || baseRate < 0) {
      toast.error("Base rate must be 0 or more.");
      return;
    }
    if (freeThreshold !== null && (isNaN(freeThreshold) || freeThreshold < 0)) {
      toast.error("Free shipping threshold must be blank or 0 or more.");
      return;
    }

    setSaving(id);
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, baseRate, freeThreshold }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Failed to update shipping zone.");
        return;
      }

      toast.success("Shipping zone updated.");
      router.refresh();
    } catch {
      toast.error("Failed to update shipping zone.");
    } finally {
      setSaving(null);
    }
  };

  if (zones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No shipping zones configured.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {zones.map((zone) => {
        const draft = drafts[zone.id];
        if (!draft) return null;

        return (
          <div key={zone.id} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`zone-name-${zone.id}`}>Zone name</Label>
              <Input
                id={`zone-name-${zone.id}`}
                value={draft.name}
                onChange={(e) => updateDraft(zone.id, "name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`zone-rate-${zone.id}`}>
                  Base rate (&pound;)
                </Label>
                <Input
                  id={`zone-rate-${zone.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.baseRate}
                  onChange={(e) =>
                    updateDraft(zone.id, "baseRate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`zone-threshold-${zone.id}`}>
                  Free over (&pound;)
                </Label>
                <Input
                  id={`zone-threshold-${zone.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No free shipping"
                  value={draft.freeThreshold}
                  onChange={(e) =>
                    updateDraft(zone.id, "freeThreshold", e.target.value)
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave the free shipping threshold blank to disable free shipping.
            </p>
            <Button
              size="sm"
              onClick={() => handleSave(zone.id)}
              disabled={saving === zone.id}
            >
              {saving === zone.id ? "Saving..." : "Save"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
