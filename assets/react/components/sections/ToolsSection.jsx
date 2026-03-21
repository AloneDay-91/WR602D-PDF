import React from "react";
import { icons, Lock, ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { hasToolAccess } from "../../lib/access";
import { cn } from "../../lib/utils";

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

const planColors = {
    FREE:    "bg-muted text-muted-foreground border-border",
    BASIC:   "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    PREMIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

export default function ToolsSection({ tools = [], user = null }) {
    if (tools.length === 0) return null;

    return (
        <section className="py-20 px-4 border-y border-border bg-muted/20">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-3">
                    <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                        Outils
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Tout ce dont vous avez besoin
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Une suite complète d'outils PDF regroupée en un seul endroit, accessible depuis votre navigateur.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.map((tool) => {
                        const Icon = getIcon(tool.icon);
                        const planName = tool.minPlan?.name ?? "FREE";
                        const accessible = hasToolAccess(user, tool);
                        const colorClass = planColors[planName] ?? planColors.FREE;

                        const card = (
                            <div className={cn(
                                "relative rounded-xl border border-border bg-card p-5 flex flex-col gap-3 transition-all duration-200",
                                accessible
                                    ? "hover:shadow-md hover:border-primary/30 group cursor-pointer"
                                    : "opacity-60 grayscale cursor-not-allowed"
                            )}>
                                {/* Icon + badge */}
                                <div className="flex items-start justify-between">
                                    <div className={cn(
                                        "rounded-lg p-2.5 w-fit transition-colors",
                                        accessible
                                            ? "bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground"
                                            : "bg-muted"
                                    )}>
                                        {accessible
                                            ? <Icon className="h-5 w-5 text-primary transition-colors group-hover:text-primary-foreground" />
                                            : <Lock className="h-5 w-5 text-muted-foreground" />
                                        }
                                    </div>
                                    {planName && planName !== "FREE" && (
                                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", colorClass)}>
                                            {planName}
                                        </span>
                                    )}
                                </div>

                                {/* Text */}
                                <div>
                                    <p className="font-semibold text-sm text-foreground">{tool.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
                                </div>

                                {/* Locked hint */}
                                {!accessible && (
                                    <p className="text-[11px] text-muted-foreground">
                                        Nécessite{" "}
                                        <a href="/abonnement" className="underline hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                                            {planName}
                                        </a>
                                    </p>
                                )}

                                {/* Hover arrow */}
                                {accessible && (
                                    <ArrowRight className="absolute bottom-4 right-4 h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        );

                        return accessible ? (
                            <a key={tool.id} href={`/convertisseur/${tool.slug}`} className="group">
                                {card}
                            </a>
                        ) : (
                            <div key={tool.id}>{card}</div>
                        );
                    })}
                </div>

                {/* Footer link */}
                <div className="text-center">
                    <a href="/convertisseur" className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        Accéder à tous les outils
                        <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </section>
    );
}