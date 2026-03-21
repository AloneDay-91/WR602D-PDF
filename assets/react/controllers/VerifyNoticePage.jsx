import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function VerifyNoticePage({ flashes = {} }) {
    const [resending, setResending] = useState(false);

    const successMsg = flashes.success?.[0] ?? null;
    const errorMsg   = flashes.error?.[0] ?? null;

    const handleResend = async () => {
        setResending(true);
        try {
            await fetch("/verify/notice", { method: "POST" });
            window.location.reload();
        } finally {
            setResending(false);
        }
    };

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

                    {successMsg && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40 px-4 py-3 text-sm text-green-800 dark:text-green-300">
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            {successMsg}
                        </div>
                    )}

                    {errorMsg && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <Card>
                        <CardHeader className="space-y-1">
                            <div className="flex justify-center mb-2">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-center">Vérifiez votre email</CardTitle>
                            <CardDescription className="text-center">
                                Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 text-sm text-muted-foreground text-center">
                            <p>
                                Vous ne recevez rien ? Vérifiez vos <strong className="text-foreground">spams</strong> ou renvoyez l'email.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={handleResend}
                                disabled={resending}
                            >
                                <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                                {resending ? "Envoi en cours…" : "Renvoyer l'email de confirmation"}
                            </Button>
                        </CardContent>

                        <CardFooter className="justify-center">
                            <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Retour à la connexion
                            </a>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ThemeProvider>
    );
}