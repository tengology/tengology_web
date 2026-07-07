"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <>
        <p className="text-sm text-muted-foreground text-center">
          Your password has been reset.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/auth/signin"
            className="underline hover:text-foreground"
          >
            Sign in with your new password
          </Link>
        </p>
      </>
    );
  }

  if (!token || !email) {
    return (
      <>
        <p className="text-sm text-destructive text-center">
          Invalid or expired reset link
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/auth/forgot-password"
            className="underline hover:text-foreground"
          >
            Request a new reset link
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-xs tracking-[0.15em] uppercase"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/auth/signin" className="underline hover:text-foreground">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/">
            <h1 className="font-heading text-3xl tracking-[0.2em] uppercase font-light">
              Tengology
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a new password
          </p>
        </div>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
