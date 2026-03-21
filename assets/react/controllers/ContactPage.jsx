import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { User, Mail, MessageSquare, Send, CheckCircle, XCircle, MapPin, Clock } from "lucide-react";

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
            <XCircle className="h-3 w-3 shrink-0" />
            {message}
        </p>
    );
}

function LabeledInput({ label, icon: Icon, id, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                <Input
                    id={id}
                    className={`${Icon ? "pl-9" : ""} ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...props}
                />
            </div>
            <FieldError message={error} />
        </div>
    );
}

export default function ContactPage({ user = null, tools = [], prefill = null }) {
    const [form, setForm] = useState({
        name:    prefill ? prefill.name  : "",
        email:   prefill ? prefill.email : "",
        subject: "",
        message: "",
    });
    const [errors, setErrors]   = useState({});
    const [status, setStatus]   = useState(null); // "success" | "error"
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setErrors((err) => ({ ...err, [field]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch("/contact/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                setForm((f) => ({ ...f, subject: "", message: "" }));
                setErrors({});
            } else {
                setErrors(data.errors ?? {});
                setStatus("error");
                setMessage("Veuillez corriger les erreurs ci-dessous.");
            }
        } catch {
            setStatus("error");
            setMessage("Une erreur est survenue. Réessayez.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1 py-16 px-4">
                    <div className="max-w-5xl mx-auto space-y-10">

                        {/* En-tête */}
                        <div className="text-center space-y-3">
                            <h1 className="text-3xl font-bold">Contactez-nous</h1>
                            <p className="text-muted-foreground max-w-lg mx-auto">
                                Une question, un problème ou une suggestion ? Notre équipe vous répond sous 24h.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Infos de contact */}
                            <div className="space-y-4">
                                <InfoCard
                                    icon={Mail}
                                    title="Email"
                                    description="contact@zenpdf.fr"
                                />
                                <InfoCard
                                    icon={Clock}
                                    title="Disponibilité"
                                    description="Lun – Ven, 9h – 18h"
                                />
                                <InfoCard
                                    icon={MapPin}
                                    title="Localisation"
                                    description="Troyes, France"
                                />
                            </div>

                            {/* Formulaire */}
                            <div className="md:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Envoyer un message</CardTitle>
                                        <CardDescription>Remplissez le formulaire ci-dessous.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {status === "success" && (
                                            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300 px-4 py-3 text-sm mb-5">
                                                <CheckCircle className="h-4 w-4 shrink-0" />
                                                <span>{message}</span>
                                            </div>
                                        )}
                                        {status === "error" && !Object.keys(errors).length && (
                                            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 px-4 py-3 text-sm mb-5">
                                                <XCircle className="h-4 w-4 shrink-0" />
                                                <span>{message}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <LabeledInput
                                                    label="Nom complet"
                                                    icon={User}
                                                    id="name"
                                                    placeholder="Jean Dupont"
                                                    value={form.name}
                                                    onChange={handleChange("name")}
                                                    error={errors.name}
                                                    required
                                                />
                                                <LabeledInput
                                                    label="Adresse email"
                                                    icon={Mail}
                                                    id="email"
                                                    type="email"
                                                    placeholder="vous@exemple.fr"
                                                    value={form.email}
                                                    onChange={handleChange("email")}
                                                    error={errors.email}
                                                    required
                                                />
                                            </div>

                                            <LabeledInput
                                                label="Sujet"
                                                icon={MessageSquare}
                                                id="subject"
                                                placeholder="Objet de votre message"
                                                value={form.subject}
                                                onChange={handleChange("subject")}
                                                error={errors.subject}
                                                required
                                            />

                                            <div className="space-y-1.5">
                                                <label htmlFor="message" className="text-sm font-medium text-foreground">
                                                    Message
                                                </label>
                                                <textarea
                                                    id="message"
                                                    rows={6}
                                                    placeholder="Décrivez votre demande..."
                                                    value={form.message}
                                                    onChange={handleChange("message")}
                                                    className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${errors.message ? "border-red-500 focus-visible:ring-red-500" : "border-input"}`}
                                                    required
                                                />
                                                <FieldError message={errors.message} />
                                            </div>

                                            <div className="flex justify-end">
                                                <Button type="submit" disabled={loading}>
                                                    {loading ? (
                                                        "Envoi en cours…"
                                                    ) : (
                                                        <>
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Envoyer le message
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}

function InfoCard({ icon: Icon, title, description }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
