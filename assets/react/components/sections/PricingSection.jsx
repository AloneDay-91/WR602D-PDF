import React from "react";
import { Check, X, Zap, Sparkles, Crown, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

function getDisplayPrice(plan) {
    return (plan.specialPrice != null && plan.specialPrice < plan.price)
        ? plan.specialPrice
        : plan.price;
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
    if (isPremium(plan, allPlans)) return <Crown className="h-4 w-4" />;
    if (isPopular(plan, allPlans)) return <Sparkles className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
}

export default function PricingSection({ plans = [], tools = [], user = null }) {
    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-3">
                    <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                        Tarifs
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Tarifs simples et transparents
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Démarrez gratuitement. Évoluez quand vous en avez besoin. Annulez à tout moment.
                    </p>
                </div>

                {/* Cards */}
                <div className={cn(
                    "grid grid-cols-1 items-start gap-6",
                    plans.length === 2 && "md:grid-cols-2 max-w-3xl mx-auto",
                    plans.length >= 3 && "md:grid-cols-3",
                )}>
                    {plans.map((plan) => {
                        const popular = isPopular(plan, plans);
                        const premium = isPremium(plan, plans);
                        const price = getDisplayPrice(plan);
                        const hasSpecial = plan.specialPrice != null && plan.specialPrice < plan.price;
                        const includedSlugs = new Set(plan.tools?.map((t) => t.slug) ?? []);

                        return (
                            <div
                                key={plan.name}
                                className={cn(
                                    "relative flex flex-col rounded-2xl border transition-all duration-300",
                                    popular  && "border-primary shadow-2xl shadow-primary/10 scale-[1.03] z-10",
                                    !popular && "border-border shadow-sm",
                                )}
                            >
                                {/* Popular ribbon */}
                                {popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                                        <Badge className="px-4 py-1 text-xs font-semibold shadow-lg shadow-primary/20">
                                            ✦ Le plus populaire
                                        </Badge>
                                    </div>
                                )}

                                {/* Header */}
                                <div className={cn(
                                    "rounded-t-2xl p-6 pb-5",
                                    popular ? "bg-gradient-to-br from-primary/15 via-primary/8 to-transparent" : "bg-card"
                                )}>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 rounded-xl p-2",
                                            popular  ? "bg-primary/15 text-primary"
                                            : premium ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                                                      : "bg-muted text-muted-foreground"
                                        )}>
                                            {planIcon(plan, plans)}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                                    <div className="mt-4 flex items-end gap-1.5">
                                        {hasSpecial && (
                                            <span className="text-base text-muted-foreground line-through mb-0.5">
                                                {plan.price.toLocaleString("fr-FR")}€
                                            </span>
                                        )}
                                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                                            {price.toLocaleString("fr-FR")}
                                        </span>
                                        <span className="text-sm text-muted-foreground mb-1.5">€ / mois</span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="px-6 pb-5">
                                    <Button
                                        className={cn("w-full", popular && "shadow-md shadow-primary/25")}
                                        variant={popular ? "default" : "outline"}
                                        size="lg"
                                        asChild
                                    >
                                        <a href={
                                            !user
                                                ? "/login"
                                                : price === 0
                                                    ? "/abonnement"
                                                    : `/abonnement/checkout/${plan.id}`
                                        }>
                                            {!user
                                                ? "Se connecter"
                                                : price === 0
                                                    ? "Commencer gratuitement"
                                                    : <span className="flex items-center gap-1.5">S'abonner <ArrowRight className="h-4 w-4" /></span>
                                            }
                                        </a>
                                    </Button>
                                </div>

                                {/* Divider */}
                                <div className="mx-6 border-t border-border" />

                                {/* Features */}
                                <div className="p-6 space-y-4 flex-1 bg-card rounded-b-2xl">
                                    {/* Quota */}
                                    <div className="flex items-center gap-2.5 text-sm font-medium">
                                        <div className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
                                        {tools.map((tool) => {
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
                    })}
                </div>

                {/* Footer link */}
                <div className="text-center">
                    <a href="/abonnement" className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        Voir tous les détails des formules
                        <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </section>
    );
}