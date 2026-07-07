"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  country: string;
  isDefault: boolean;
}

const empty = {
  label: "Home",
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  county: "",
  postcode: "",
  country: "GB",
  isDefault: false,
};

export function AddressBook({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const startNew = () => {
    setEditingId(null);
    setForm(empty);
    setShowForm(true);
  };

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      firstName: addr.firstName,
      lastName: addr.lastName,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      county: addr.county ?? "",
      postcode: addr.postcode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : "/api/account/addresses";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      if (editingId) {
        setAddresses((all) =>
          all.map((a) => (a.id === editingId ? data.address : a))
        );
      } else {
        setAddresses((all) => [data.address, ...all]);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setAddresses((all) => all.filter((a) => a.id !== id));
  };

  const setDefault = async (id: string) => {
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      setAddresses((all) =>
        all.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    }
  };

  const update = (field: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href="/account"
        className="eyebrow transition-colors hover:text-foreground"
      >
        &larr; Back to account
      </Link>
      <header className="mt-4 mb-10 border-t pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-4">Account</p>
            <h1 className="font-heading text-4xl leading-[0.95] sm:text-5xl">
              Addresses
            </h1>
          </div>
          {!showForm && (
            <Button
              onClick={startNew}
              variant="outline"
              size="sm"
              className="text-xs uppercase tracking-[0.15em]"
            >
              Add address
            </Button>
          )}
        </div>
      </header>

      {showForm && (
        <form onSubmit={save} className="mb-8 border p-5 space-y-3">
          {error && (
            <div className="border border-clay/40 bg-clay/5 p-3 text-sm text-clay">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => update("label", e.target.value)}
                placeholder="Home, Work…"
              />
            </div>
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input
                id="line1"
                value={form.line1}
                onChange={(e) => update("line1", e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="line2">Address line 2</Label>
              <Input
                id="line2"
                value={form.line2}
                onChange={(e) => update("line2", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={form.county}
                onChange={(e) => update("county", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={form.postcode}
                onChange={(e) => update("postcode", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => update("isDefault", e.target.checked)}
            />
            Set as default
          </label>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="text-xs uppercase tracking-[0.15em]"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="text-xs uppercase tracking-[0.15em]"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="border py-16 text-center">
          <p className="eyebrow mb-3">Address book</p>
          <p className="font-heading mb-6 text-2xl">
            No saved addresses <em>yet</em>
          </p>
          <Button
            onClick={startNew}
            className="text-xs uppercase tracking-[0.15em]"
          >
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between border p-4"
            >
              <div className="text-sm">
                <p className="font-heading text-lg">
                  {a.label}
                  {a.isDefault && (
                    <span className="eyebrow ml-3 text-moss-dark">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground mt-1">
                  {a.firstName} {a.lastName}
                </p>
                <p className="text-muted-foreground">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {a.city}
                  {a.county ? `, ${a.county}` : ""} {a.postcode}
                </p>
                <p className="text-muted-foreground">{a.country}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 text-xs">
                <button
                  onClick={() => startEdit(a)}
                  className="link-underline text-foreground transition-colors hover:text-moss"
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault(a.id)}
                    className="link-underline text-foreground transition-colors hover:text-moss"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => remove(a.id)}
                  className="link-underline text-clay"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
