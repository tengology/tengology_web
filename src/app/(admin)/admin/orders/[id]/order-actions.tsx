"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "FULFILLING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "PAYMENT_FAILED",
];

interface OrderActionsProps {
  orderId: string;
  status: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
}

export function OrderActions({
  orderId,
  status: initialStatus,
  shippingCarrier,
  trackingNumber,
}: OrderActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [carrier, setCarrier] = useState(shippingCarrier ?? "");
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "SHIPPED"
            ? { shippingCarrier: carrier, trackingNumber: tracking }
            : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update order");
      }

      toast.success("Order updated");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update order"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border rounded-md p-4">
      <h2 className="text-xs tracking-wider uppercase text-muted-foreground font-medium mb-4">
        Update order
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="order-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              if (value) setStatus(value);
            }}
          >
            <SelectTrigger id="order-status" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {status === "SHIPPED" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                placeholder="e.g. Royal Mail"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking-number">Tracking number</Label>
              <Input
                id="tracking-number"
                placeholder="e.g. AB123456789GB"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </section>
  );
}
