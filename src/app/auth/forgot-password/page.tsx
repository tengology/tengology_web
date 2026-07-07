"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSubmitted(true);
  };

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
            Reset your password
          </p>
        </div>

        {submitted ? (
          <p className="text-sm text-muted-foreground text-center">
            If an account exists for that email, we&apos;ve sent a reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-xs tracking-[0.15em] uppercase"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link
            href="/auth/signin"
            className="underline hover:text-foreground"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
