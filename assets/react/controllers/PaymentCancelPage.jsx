import React from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "../components/ui/button";

export default function PaymentCancelPage({ user = null }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header user={user} />

                <main className="flex-1 flex items-center justify-center px-4 py-20">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-red-100 dark:bg-red-950 p-5">
                                <XCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Paiement annulé</h1>
                            <p className="text-muted-foreground">
                                Votre paiement n'a pas été effectué. Aucun montant n'a été débité.
                                Vous pouvez réessayer à tout moment.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button asChild>
                                <a href="/abonnement">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Voir les formules
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="/">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour à l'accueil
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