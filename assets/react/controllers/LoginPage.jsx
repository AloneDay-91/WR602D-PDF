import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Eye, EyeOff, Mail, Lock, XCircle, ChevronLeft } from "lucide-react";

export default function LoginPage({ last_username = "", error = null, csrfToken = "" }) {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

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
                            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
                            <CardDescription className="text-center">
                                Connectez-vous à votre compte ZenPDF.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {error && (
                                <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 px-4 py-3 text-sm">
                                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form
                                method="post"
                                action="/login"
                                onSubmit={() => setLoading(true)}
                                className="space-y-4"
                            >
                                <input type="hidden" name="_csrf_token" value={csrfToken} />

                                <div className="space-y-1.5">
                                    <label htmlFor="username" className="text-sm font-medium text-foreground">
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="username"
                                            name="_username"
                                            type="email"
                                            placeholder="vous@exemple.fr"
                                            defaultValue={last_username}
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                                            Mot de passe
                                        </label>
                                        <a
                                            href="/reset-password"
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Mot de passe oublié ?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            name="_password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            autoComplete="current-password"
                                            className="pl-9 pr-9"
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
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Connexion…" : "Se connecter"}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center">
                            <p className="text-sm text-muted-foreground">
                                Pas encore de compte ?{" "}
                                <a href="/register" className="text-foreground font-medium hover:underline">
                                    S'inscrire
                                </a>
                            </p>
                        </CardFooter>
                    </Card>
                    <div className="text-center">
                        <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 justify-center">
                            <ChevronLeft className='h-4 w-4' />
                            Retour à l'accueil
                        </a>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
