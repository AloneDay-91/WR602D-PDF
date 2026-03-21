import React from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Mail } from "lucide-react";

export default function CheckEmailPage({ expiresAt = "" }) {
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
                            <div className="flex justify-center mb-2">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-center">Email envoyé !</CardTitle>
                            <CardDescription className="text-center">
                                Si un compte existe avec cette adresse, vous allez recevoir un email.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 text-sm text-muted-foreground text-center">
                            {expiresAt && (
                                <p>Le lien sera valable <strong className="text-foreground">{expiresAt}</strong>.</p>
                            )}
                            <p>
                                Vous ne recevez rien ? Vérifiez vos spams ou{" "}
                                <a href="/reset-password" className="text-foreground underline underline-offset-2 hover:no-underline">
                                    réessayez
                                </a>
                                .
                            </p>
                        </CardContent>

                        <CardFooter className="justify-center">
                            <a
                                href="/login"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Retour à la connexion
                            </a>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ThemeProvider>
    );
}