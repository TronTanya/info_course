import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts valid credentials shape", () => {
    const result = loginSchema.safeParse({
      email: "student@cyberedu.local",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toMatch(/email/i);
    }
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "a@b.ru", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password?.[0]).toMatch(/пароль/i);
    }
  });
});

describe("forgotPasswordSchema", () => {
  it("requires valid email", () => {
    const bad = forgotPasswordSchema.safeParse({ email: "bad" });
    expect(bad.success).toBe(false);
    const ok = forgotPasswordSchema.safeParse({ email: "user@example.com" });
    expect(ok.success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("requires matching strong passwords", () => {
    const mismatch = resetPasswordSchema.safeParse({
      token: "tok",
      password: "Password1",
      confirmPassword: "Password2",
    });
    expect(mismatch.success).toBe(false);

    const weak = resetPasswordSchema.safeParse({
      token: "tok",
      password: "short",
      confirmPassword: "short",
    });
    expect(weak.success).toBe(false);

    const ok = resetPasswordSchema.safeParse({
      token: "tok",
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(ok.success).toBe(true);
  });
});
