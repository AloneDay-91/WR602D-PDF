import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";

const faqs = [
    {
        question: "Quels formats de fichiers sont supportés ?",
        answer: "ZenPDF supporte la conversion depuis HTML, Markdown, images (JPG, PNG, WebP) et URLs de pages web. Vous pouvez également fusionner et compresser des fichiers PDF existants.",
    },
    {
        question: "Mes fichiers sont-ils en sécurité ?",
        answer: "Oui. Tous les fichiers sont traités sur des serveurs sécurisés et automatiquement supprimés après la conversion. Nous ne stockons jamais vos documents.",
    },
    {
        question: "Quelle est la taille maximale des fichiers ?",
        answer: "Le plan gratuit accepte des fichiers jusqu'à 5 Mo. Le plan Pro monte jusqu'à 50 Mo, et le plan Entreprise n'a pas de limite de taille.",
    },
    {
        question: "Puis-je utiliser ZenPDF via une API ?",
        answer: "Oui, le plan Entreprise inclut un accès API complet avec documentation, clés d'authentification et support technique dédié pour l'intégration.",
    },
    {
        question: "Comment fonctionne l'essai gratuit ?",
        answer: "L'essai gratuit du plan Pro dure 14 jours. Aucune carte bancaire n'est requise. Vous gardez l'accès complet aux fonctionnalités Pro pendant toute la durée de l'essai.",
    },
    {
        question: "Puis-je annuler mon abonnement à tout moment ?",
        answer: "Oui, vous pouvez annuler à tout moment depuis votre espace compte. Votre accès restera actif jusqu'à la fin de la période de facturation en cours.",
    },
];

export default function FaqSection() {
    return (
        <section className="py-20 px-4 bg-background border-t">
            <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl">Questions fréquentes</h2>
                    <p className="text-muted-foreground">
                        Tout ce que vous devez savoir sur ZenPDF.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">{faq.answer}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
