import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

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

function FeatureItem({ included, label }) {
    return (
        <li className="flex items-center gap-2 text-sm">
            {included ? (
                <Check className="h-4 w-4 text-primary shrink-0" />
            ) : (
                <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            )}
            <span className={cn(!included && "text-muted-foreground/60 line-through")}>
                {label}
            </span>
        </li>
    );
}

export default function PricingSection({ plans = [], tools = [] }) {
    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl">Tarifs simples et transparents</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Choisissez le plan adapté à vos besoins. Changez ou annulez à tout moment.
                    </p>
                </div>

                <div className={cn(
                    "grid grid-cols-1 gap-6",
                    plans.length === 2 && "md:grid-cols-2 max-w-3xl mx-auto",
                    plans.length >= 3 && "md:grid-cols-3",
                )}>
                    {plans.map((plan) => {
                        const popular = isPopular(plan, plans);
                        const price = getDisplayPrice(plan);
                        const hasSpecial = plan.specialPrice != null && plan.specialPrice < plan.price;
                        const includedSlugs = new Set(plan.tools?.map((t) => t.slug) ?? []);

                        return (
                            <Card
                                key={plan.name}
                                className={cn(
                                    "flex flex-col",
                                    popular && "border-primary shadow-lg scale-105"
                                )}
                            >
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
                                        <span className="text-4xl font-bold">{price.toLocaleString("fr-FR")}&euro;</span>
                                        <span className="text-muted-foreground text-sm"> /mois</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-medium">
                                                {plan.limitGeneration === -1
                                                    ? "Conversions illimitées"
                                                    : `${plan.limitGeneration} conversions / jour`}
                                            </span>
                                        </li>

                                        <li className="border-t border-border my-2" />

                                        {tools.map((tool) => (
                                            <FeatureItem
                                                key={tool.slug}
                                                included={includedSlugs.has(tool.slug)}
                                                label={tool.name}
                                            />
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        variant={popular ? "default" : "outline"}
                                        className="w-full"
                                    >
                                        {price === 0 ? "Commencer" : "Choisir ce plan"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
