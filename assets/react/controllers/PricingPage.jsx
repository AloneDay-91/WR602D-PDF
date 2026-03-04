import React from "react";
import { Check, X, Zap } from "lucide-react";
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

function PricingCard({ plan, allPlans, allTools }) {
    const popular = isPopular(plan, allPlans);
    const price = getDisplayPrice(plan);
    const hasSpecial = plan.specialPrice != null && plan.specialPrice < plan.price;
    const includedToolSlugs = new Set(plan.tools.map((t) => t.slug));

    return (
        <Card className={cn(
            "flex flex-col",
            popular && "border-primary shadow-lg scale-105"
        )}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {popular && <Badge>Populaire</Badge>}
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
                <Button variant={popular ? "default" : "outline"} className="w-full">
                    {price === 0 ? "Commencer gratuitement" : "Choisir ce plan"}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function PricingPage({ plans = [], tools = [] }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} />

                <main className="flex-1 py-20 px-4">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div className="text-center space-y-3">
                            <h1 className="text-3xl">Formules & Tarifs</h1>
                            <p className="text-muted-foreground max-w-lg mx-auto">
                                Choisissez le plan adapté à vos besoins. Changez ou annulez à tout moment.
                            </p>
                        </div>

                        <div className={cn(
                            "grid grid-cols-1 gap-6",
                            plans.length === 2 && "md:grid-cols-2 max-w-3xl mx-auto",
                            plans.length >= 3 && "md:grid-cols-3",
                        )}>
                            {plans.map((plan) => (
                                <PricingCard
                                    key={plan.name}
                                    plan={plan}
                                    allPlans={plans}
                                    allTools={tools}
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