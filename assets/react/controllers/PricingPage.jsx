import React, { useState } from "react";
import { Check, X, Zap, Loader2, CheckCircle, XCircle, Sparkles, Crown, ArrowRight, Shield, Clock, Headphones } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { cn } from "../lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDisplayPrice(plan, annual) {
    const base = (plan.specialPrice != null && plan.specialPrice < plan.price)
        ? plan.specialPrice
        : plan.price;
    return annual && base > 0 ? +(base * 0.8).toFixed(2) : base;
}

function isPopular(plan, allPlans) {
    if (allPlans.length < 2) return false;
    const sorted = [...allPlans].sort((a, b) => a.price - b.price);
    return sorted.length >= 2 && plan.name === sorted[1].name;
}

function isPremium(plan, allPlans) {
    const sorted = [...allPlans].sort((a, b) => a.price - b.price);
    return plan.name === sorted[sorted.length - 1]?.name && plan.price > 0;
}

function planIcon(plan, allPlans) {
    if (isPremium(plan, allPlans)) return <Crown className="h-5 w-5" />;
    if (isPopular(plan, allPlans)) return <Sparkles className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
}

// ─── Alert ────────────────────────────────────────────────────────────────────
function Alert({ variant, children }) {
    const ok = variant === "success";
    return (
        <div className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm max-w-lg mx-auto",
            ok  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300"
                : "bg-destructive/10 border-destructive/20 text-destructive"
        )}>
            {ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            <span>{children}</span>
        </div>
    );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, allPlans, allTools, currentPlanId, onSelect, isLoading, isLoggedIn, annual }) {
    const popular       = isPopular(plan, allPlans);
    const premium       = isPremium(plan, allPlans);
    const price         = getDisplayPrice(plan, annual);
    const originalPrice = getDisplayPrice(plan, false);
    const hasDiscount   = annual && plan.price > 0;
    const hasSpecial    = plan.specialPrice != null && plan.specialPrice < plan.price;
    const includedSlugs = new Set(plan.tools.map((t) => t.slug));
    const isCurrent     = currentPlanId === plan.id;

    return (
        <div className={cn(
            "relative flex flex-col rounded-2xl border transition-all duration-300",
            popular  && "border-primary shadow-2xl shadow-primary/10 scale-[1.03] z-10",
            premium  && !popular && "border-border shadow-lg",
            !popular && !premium && "border-border shadow-sm",
            isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}>
            {/* Popular ribbon */}
            {popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="px-4 py-1 text-xs font-semibold shadow-lg shadow-primary/20">
                        ✦ Le plus populaire
                    </Badge>
                </div>
            )}

            {/* Card header with gradient for popular */}
            <div className={cn(
                "rounded-t-2xl p-6 pb-5",
                popular  ? "bg-gradient-to-br from-primary/15 via-primary/8 to-transparent"
                         : "bg-card"
            )}>
                {/* Plan name + badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={cn(
                        "inline-flex items-center gap-2 rounded-xl p-2",
                        popular  ? "bg-primary/15 text-primary"
                        : premium ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                                  : "bg-muted text-muted-foreground"
                    )}>
                        {planIcon(plan, allPlans)}
                    </div>
                    <div className="flex gap-1.5">
                        {isCurrent && <Badge variant="secondary" className="text-xs">Actuel</Badge>}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{plan.description}</p>

                {/* Prix */}
                <div className="mt-4 flex items-end gap-1.5">
                    {(hasDiscount || hasSpecial) && (
                        <span className="text-base text-muted-foreground line-through mb-0.5">
                            {originalPrice.toLocaleString("fr-FR")}€
                        </span>
                    )}
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        {price.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1.5">
                        € / mois{annual && plan.price > 0 ? ", facturé annuellement" : ""}
                    </span>
                </div>
                {hasDiscount && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        🎉 20% d'économie avec le plan annuel
                    </p>
                )}
            </div>

            {/* CTA */}
            <div className="px-6 pb-5">
                <Button
                    className={cn("w-full", popular && "shadow-md shadow-primary/25")}
                    variant={isCurrent ? "secondary" : popular ? "default" : "outline"}
                    size="lg"
                    disabled={isCurrent || isLoading}
                    onClick={() => onSelect(plan)}
                >
                    {isLoading
                        ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        : null}
                    {isCurrent
                        ? "Formule actuelle"
                        : !isLoggedIn
                            ? "Se connecter"
                            : price === 0
                                ? "Commencer gratuitement"
                                : <>S'abonner <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                </Button>
            </div>

            {/* Séparateur */}
            <div className="mx-6 border-t border-border" />

            {/* Features */}
            <div className="p-6 space-y-4 flex-1">
                {/* Quota */}
                <div className="flex items-center gap-2.5 text-sm font-medium">
                    <div className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                        "bg-primary/10 text-primary"
                    )}>
                        <Zap className="h-2.5 w-2.5" />
                    </div>
                    <span>
                        {plan.limitGeneration === -1
                            ? "Conversions illimitées"
                            : `${plan.limitGeneration} conversions / jour`}
                    </span>
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Outils inclus
                </p>

                <ul className="space-y-2.5">
                    {allTools.map((tool) => {
                        const included = includedSlugs.has(tool.slug);
                        return (
                            <li key={tool.slug} className="flex items-center gap-2.5 text-sm">
                                {included ? (
                                    <span className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Check className="h-2.5 w-2.5" />
                                    </span>
                                ) : (
                                    <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <X className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    </span>
                                )}
                                <span className={cn(!included && "text-muted-foreground/50 line-through")}>
                                    {tool.name}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────
function TrustItem({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <span>{label}</span>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PricingPage({ plans = [], tools = [], user = null, currentPlanId = null }) {
    const [loadingPlanId, setLoadingPlanId] = useState(null);
    const [status, setStatus]               = useState(null);
    const [message, setMessage]             = useState("");
    const [currentId, setCurrentId]         = useState(currentPlanId);
    const [annual, setAnnual]               = useState(false);

    const handleSelectPlan = async (plan) => {
        if (!user) { window.location.href = "/login"; return; }
        if (plan.price > 0) { window.location.href = `/abonnement/checkout/${plan.id}`; return; }

        setLoadingPlanId(plan.id);
        setStatus(null);
        try {
            const res  = await fetch(`/abonnement/select-plan/${plan.id}`, { method: "POST", headers: { "Content-Type": "application/json" } });
            const data = await res.json();
            if (res.ok) { setStatus("success"); setMessage(data.message); setCurrentId(plan.id); }
            else         { setStatus("error");   setMessage(data.error || "Une erreur est survenue."); }
        } catch {
            setStatus("error"); setMessage("Une erreur de réseau est survenue.");
        } finally { setLoadingPlanId(null); }
    };

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1">
                    {/* ── Hero ── */}
                    <section className="relative py-20 px-4 text-center overflow-hidden">
                        {/* Background déco */}
                        <div className="absolute inset-0 -z-10 pointer-events-none">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
                        </div>

                        <Badge variant="outline" className="mb-4 px-3 py-1 text-xs gap-1.5 border-primary/30 text-primary">
                            <Sparkles className="h-3 w-3" />
                            Tarification simple & transparente
                        </Badge>

                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                            Choisissez votre formule
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
                            Démarrez gratuitement. Évoluez quand vous en avez besoin.<br />
                            Annulez à tout moment, sans engagement.
                        </p>

                        {/* Toggle mensuel / annuel */}
                        <div className="inline-flex items-center gap-3 bg-muted rounded-full px-2 py-1.5">
                            <button
                                onClick={() => setAnnual(false)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                    !annual ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Mensuel
                            </button>
                            <button
                                onClick={() => setAnnual(true)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                                    annual ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Annuel
                                <span className="text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                                    -20%
                                </span>
                            </button>
                        </div>
                    </section>

                    {/* ── Alert ── */}
                    {status && (
                        <div className="px-4 pb-4 flex justify-center">
                            <Alert variant={status}>{message}</Alert>
                        </div>
                    )}

                    {/* ── Plans ── */}
                    <section className="px-4 pb-20">
                        <div className={cn(
                            "max-w-5xl mx-auto grid grid-cols-1 items-start gap-6 pt-4",
                            plans.length === 2 && "md:grid-cols-2 max-w-3xl",
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
                                    annual={annual}
                                />
                            ))}
                        </div>
                    </section>

                    {/* ── Trust strip ── */}
                    <section className="border-t border-border bg-muted/30 py-10 px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                                <TrustItem icon={Shield}     label="Paiement sécurisé par Stripe" />
                                <TrustItem icon={Clock}      label="Annulation à tout moment" />
                                <TrustItem icon={Headphones} label="Support inclus dans tous les plans" />
                                <TrustItem icon={CheckCircle} label="Aucune carte requise pour le plan gratuit" />
                            </div>
                        </div>
                    </section>

                    {/* ── FAQ / CTA ── */}
                    <section className="py-20 px-4 text-center">
                        <div className="max-w-xl mx-auto space-y-4">
                            <h2 className="text-2xl font-bold">Une question ?</h2>
                            <p className="text-muted-foreground">
                                Notre équipe est disponible pour vous aider à choisir la formule adaptée à vos besoins.
                            </p>
                            <Button variant="outline" asChild>
                                <a href="/contact">Contacter le support</a>
                            </Button>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}