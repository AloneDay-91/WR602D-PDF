import React, { useState } from "react";
import { Check, X, Zap, Loader2, CheckCircle, XCircle } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { cn } from "../lib/utils";

function getDisplayPrice(plan) {
    if (plan.specialPrice != null && plan.specialPrice < plan.price) {
        return plan.specialPrice;
    }
    return plan.price;
}

function isPopular(plan, allPlans) {
    if (allPlans.length < 2) return false;
    const sorted = [...allPlans].sort((a, b) => a.price - b.price);
    return sorted.length >= 2 && plan.name === sorted[1].name;
}

function Alert({ variant, children }) {
    if (variant === "success") {
        return (
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300 px-4 py-3 text-sm max-w-lg mx-auto mb-8">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{children}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 px-4 py-3 text-sm max-w-lg mx-auto mb-8">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}

function PricingCard({ plan, allPlans, allTools, currentPlanId, onSelect, isLoading, isLoggedIn }) {
    const popular = isPopular(plan, allPlans);
    const price = getDisplayPrice(plan);
    const hasSpecial = plan.specialPrice != null && plan.specialPrice < plan.price;
    const includedToolSlugs = new Set(plan.tools.map((t) => t.slug));
    const isCurrentPlan = currentPlanId === plan.id;

    return (
        <Card className={cn(
            "flex flex-col transition-all duration-300",
            popular && "border-primary shadow-lg scale-105 z-10",
            isCurrentPlan && "ring-1 ring-offset-1"
        )}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-1">
                        {isCurrentPlan && <Badge variant="secondary">Actuel</Badge>}
                        {popular && <Badge>Populaire</Badge>}
                    </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                    {hasSpecial && (
                        <span className="text-lg text-muted-foreground line-through mr-2">
                            {plan.price.toLocaleString("fr-FR")}&euro;
                        </span>
                    )}
                    <span className="text-4xl font-bold">{price.toLocaleString("fr-FR")}</span>
                    <span className="text-muted-foreground text-sm">&euro; /mois</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    {plan.limitGeneration === -1
                        ? "Conversions illimitées"
                        : `${plan.limitGeneration} conversions / jour`}
                </div>

                <div className="border-t border-border" />

                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outils inclus</p>
                    <ul className="space-y-2">
                        {allTools.map((tool) => {
                            const included = includedToolSlugs.has(tool.slug);
                            return (
                                <li key={tool.slug} className="flex items-center gap-2 text-sm">
                                    {included ? (
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                    ) : (
                                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                    )}
                                    <span className={cn(!included && "text-muted-foreground/50 line-through")}>
                                        {tool.name}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    variant={isCurrentPlan ? "secondary" : (popular ? "default" : "outline")}
                    className="w-full"
                    disabled={isCurrentPlan || isLoading}
                    onClick={() => onSelect(plan)}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isCurrentPlan
                        ? "Formule actuelle"
                        : (!isLoggedIn ? "Se connecter" : (price === 0 ? "Commencer gratuitement" : "S'abonner"))}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function PricingPage({ plans = [], tools = [], user = null, currentPlanId = null }) {
    const [loadingPlanId, setLoadingPlanId] = useState(null);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState("");
    const [currentId, setCurrentId] = useState(currentPlanId);

    const handleSelectPlan = async (plan) => {
        if (!user) {
            window.location.href = "/login";
            return;
        }

        // Plan payant → redirection vers Stripe Checkout
        if (plan.price > 0) {
            window.location.href = `/abonnement/checkout/${plan.id}`;
            return;
        }

        // Plan gratuit → sélection directe
        setLoadingPlanId(plan.id);
        setStatus(null);

        try {
            const res = await fetch(`/abonnement/select-plan/${plan.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                setCurrentId(plan.id);
            } else {
                setStatus("error");
                setMessage(data.error || "Une erreur est survenue.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Une erreur de réseau est survenue.");
        } finally {
            setLoadingPlanId(null);
        }
    };

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1 py-20 px-4">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div className="text-center space-y-3">
                            <h1 className="text-3xl font-bold">Formules & Tarifs</h1>
                            <p className="text-muted-foreground max-w-lg mx-auto">
                                Choisissez le plan adapté à vos besoins. Changez ou annulez à tout moment.
                            </p>
                        </div>

                        {status && <Alert variant={status}>{message}</Alert>}

                        <div className={cn(
                            "grid grid-cols-1 gap-8 pt-4",
                            plans.length === 2 && "md:grid-cols-2 max-w-3xl mx-auto",
                            plans.length >= 3 && "md:grid-cols-3",
                        )}>
                            {plans.map((plan) => (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan}
                                    allPlans={plans}
                                    allTools={tools}
                                    currentPlanId={currentId}
                                    isLoggedIn={!!user}
                                    isLoading={loadingPlanId === plan.id}
                                    onSelect={handleSelectPlan}
                                />
                            ))}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}
