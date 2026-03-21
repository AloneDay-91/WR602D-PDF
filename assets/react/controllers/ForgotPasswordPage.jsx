import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Mail, ArrowLeft, XCircle } from "lucide-react";

export default function ForgotPasswordPage({ errors = [], csrfToken = "" }) {
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
                            <CardTitle className="text-2xl text-center">Mot de passe oublié</CardTitle>
                            <CardDescription className="text-center">
                                Entrez votre email pour recevoir un lien de réinitialisation.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {errors.map((msg, i) => (
                                <div key={i} className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 px-4 py-3 text-sm">
                                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{msg}</span>
                                </div>
                            ))}

                            <form
                                method="post"
                                action="/reset-password"
                                onSubmit={() => setLoading(true)}
                                className="space-y-4"
                            >
                                <input type="hidden" name="reset_password_request_form[_token]" value={csrfToken} />

                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="reset_password_request_form[email]"
                                            type="email"
                                            placeholder="vous@exemple.fr"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Envoi en cours…" : "Envoyer le lien"}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center">
                            <a
                                href="/login"
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Retour à la connexion
                            </a>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ThemeProvider>
    );
}