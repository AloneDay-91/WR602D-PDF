import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";

const faqs = [
    {
        question: "Quels formats de fichiers sont supportés ?",
        answer: "ZenPDF supporte la conversion depuis HTML, URL, Word, Excel, PowerPoint, images (JPG, PNG, WebP). Vous pouvez également fusionner, découper, chiffrer et convertir en PDF/A.",
    },
    {
        question: "Mes fichiers sont-ils en sécurité ?",
        answer: "Oui. Tous les fichiers sont traités sur des serveurs sécurisés et automatiquement supprimés après la conversion. Nous ne stockons jamais vos documents de manière permanente.",
    },
    {
        question: "Quelle est la taille maximale des fichiers ?",
        answer: "Le plan gratuit accepte des fichiers jusqu'à 5 Mo. Les plans payants augmentent cette limite. Consultez les tarifs pour plus de détails.",
    },
    {
        question: "Comment fonctionne la limite de conversions ?",
        answer: "La limite s'applique par jour et se réinitialise chaque nuit à minuit. Le plan gratuit offre un nombre de conversions limité, les plans payants permettent plus de conversions voire illimitées.",
    },
    {
        question: "Puis-je annuler mon abonnement à tout moment ?",
        answer: "Oui, vous pouvez annuler à tout moment depuis votre espace compte via le portail Stripe. Votre accès restera actif jusqu'à la fin de la période de facturation en cours.",
    },
    {
        question: "Comment fonctionne le paiement ?",
        answer: "Le paiement est sécurisé par Stripe. Nous acceptons les cartes bancaires principales. Vous recevez une facture par email après chaque paiement, accessible depuis votre espace compte.",
    },
];

export default function FaqSection() {
    return (
        <section className="py-20 px-4 border-t border-border bg-muted/20">
            <div className="max-w-2xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-3">
                    <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                        FAQ
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Questions fréquentes
                    </h2>
                    <p className="text-muted-foreground">
                        Tout ce que vous devez savoir sur ZenPDF.
                    </p>
                </div>

                {/* Accordion */}
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-border rounded-xl px-4 bg-card data-[state=open]:border-primary/30 transition-colors"
                        >
                            <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground pb-4 leading-relaxed">{faq.answer}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Contact nudge */}
                <div className="text-center space-y-3 pt-4">
                    <p className="text-sm text-muted-foreground">Vous ne trouvez pas la réponse à votre question ?</p>
                    <Button variant="outline" asChild>
                        <a href="/contact" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Contacter le support
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}