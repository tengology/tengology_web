"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  initial: {
    name: string;
    email: string;
    phone: string;
    hasPassword: boolean;
  };
}

export function ProfileForm({ initial }: Props) {
  const [profile, setProfile] = useState({
    name: initial.name,
    phone: initial.phone,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    setProfileError("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setProfileMessage("Profile updated");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update"
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMessage("");
    setPwError("");
    if (passwords.newPassword !== passwords.confirm) {
      setPwError("Passwords do not match");
      setPwSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setPwMessage("Password updated");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href="/account"
        className="eyebrow transition-colors hover:text-foreground"
      >
        &larr; Back to account
      </Link>
      <header className="mt-4 mb-10 border-t pt-6">
        <p className="eyebrow mb-4">Account</p>
        <h1 className="font-heading text-4xl leading-[0.95] sm:text-5xl">
          Profile
        </h1>
      </header>

      <form onSubmit={saveProfile} className="space-y-4 mb-12">
        <h2 className="eyebrow text-foreground">Details</h2>
        {profileError && (
          <p className="text-sm text-clay">{profileError}</p>
        )}
        {profileMessage && (
          <p className="text-sm text-moss">{profileMessage}</p>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={initial.email} disabled />
          <p className="text-xs text-muted-foreground mt-1">
            Contact support to change your email.
          </p>
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({ ...p, phone: e.target.value }))
            }
          />
        </div>

        <Button
          type="submit"
          disabled={profileSaving}
          className="text-xs uppercase tracking-[0.15em]"
        >
          {profileSaving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 border-t pt-8">
        <h2 className="eyebrow text-foreground">
          {initial.hasPassword ? "Change password" : "Set password"}
        </h2>
        {pwError && <p className="text-sm text-clay">{pwError}</p>}
        {pwMessage && <p className="text-sm text-moss">{pwMessage}</p>}

        {initial.hasPassword && (
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((p) => ({
                  ...p,
                  currentPassword: e.target.value,
                }))
              }
              required
            />
          </div>
        )}

        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, newPassword: e.target.value }))
            }
            minLength={8}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, confirm: e.target.value }))
            }
            minLength={8}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={pwSaving}
          className="text-xs uppercase tracking-[0.15em]"
        >
          {pwSaving ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
