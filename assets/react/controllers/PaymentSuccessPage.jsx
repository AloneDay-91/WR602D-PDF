import React from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckCircle, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "../components/ui/button";

export default function PaymentSuccessPage({ user = null }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header user={user} />

                <main className="flex-1 flex items-center justify-center px-4 py-20">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-green-100 dark:bg-green-950 p-5">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Paiement réussi !</h1>
                            <p className="text-muted-foreground">
                                Votre abonnement a bien été activé. Vous pouvez dès maintenant profiter de toutes les fonctionnalités de votre plan.
                            </p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Une confirmation vous a été envoyée par email.
        votre plan sera mis à jour dans quelques instants via notre système de webhook.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button asChild>
                                <a href="/convertisseur">
                                    Commencer à convertir
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="/compte">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Mon compte
                                </a>
                            </Button>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}