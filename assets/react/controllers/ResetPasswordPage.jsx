import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react";

function Alert({ variant = "danger", children }) {
    const styles = {
        danger: "bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300",
    };
    return (
        <div className={`flex items-start gap-2 rounded-md px-4 py-3 text-sm ${styles[variant]}`}>
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{children}</span>
        </div>
    );
}

function PasswordStrength({ password }) {
    if (!password) return null;
    const checks = [
        { label: "8 caractères minimum", ok: password.length >= 8 },
        { label: "Une majuscule", ok: /[A-Z]/.test(password) },
        { label: "Un chiffre", ok: /\d/.test(password) },
        { label: "Un caractère spécial", ok: /[^A-Za-z0-9]/.test(password) },
    ];
    return (
        <ul className="space-y-1 mt-2">
            {checks.map(({ label, ok }) => (
                <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                    {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {label}
                </li>
            ))}
        </ul>
    );
}

export default function ResetPasswordPage({ errors = [], resetErrors = [], csrfToken = "" }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const mismatch = confirm.length > 0 && password !== confirm;

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-md space-y-6">

                    <div className="text-center">
                        <a href="/">
                            <img src="/images/logo-icon.png" alt="ZenPDF" className="h-10 mx-auto dark:hidden" />
                            <img src="/images/logo-icon-dark.png" alt="ZenPDF" className="h-10 mx-auto hidden dark:block" />
                        </a>
                    </div>

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center">Nouveau mot de passe</CardTitle>
                            <CardDescription className="text-center">
                                Choisissez un mot de passe sécurisé pour votre compte.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {resetErrors.map((msg, i) => <Alert key={i}>{msg}</Alert>)}
                            {errors.map((msg, i) => <Alert key={i}>{msg}</Alert>)}

                            <form
                                method="post"
                                action="/reset-password/reset"
                                onSubmit={() => setLoading(true)}
                                className="space-y-4"
                            >
                                <input type="hidden" name="change_password_form[_token]" value={csrfToken} />

                                {/* Nouveau mot de passe */}
                                <div className="space-y-1.5">
                                    <label htmlFor="password_first" className="text-sm font-medium text-foreground">
                                        Nouveau mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password_first"
                                            name="change_password_form[plainPassword][first]"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            autoFocus
                                            autoComplete="new-password"
                                            className="pl-9 pr-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <PasswordStrength password={password} />
                                </div>

                                {/* Confirmation */}
                                <div className="space-y-1.5">
                                    <label htmlFor="password_second" className="text-sm font-medium text-foreground">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password_second"
                                            name="change_password_form[plainPassword][second]"
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            autoComplete="new-password"
                                            className={`pl-9 pr-9 ${mismatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {mismatch && (
                                        <p className="text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading || mismatch || password.length < 12}
                                >
                                    {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center">
                            <a
                                href="/reset-password"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Demander un nouveau lien
                            </a>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ThemeProvider>
    );
}
