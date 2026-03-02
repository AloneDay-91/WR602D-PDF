import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
    User, Mail, Phone, Calendar, Palette, Lock, Eye, EyeOff,
    CheckCircle, XCircle, Zap, CreditCard, ShieldCheck,
} from "lucide-react";

function Alert({ variant, children }) {
    if (variant === "success") {
        return (
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300 px-4 py-3 text-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{children}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 px-4 py-3 text-sm">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}

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

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1,3),16)/255,
          g = parseInt(hex.slice(3,5),16)/255,
          b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else                h = ((r - g) / d + 4) / 6;
    }
    return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}

function applyPrimaryColor(hex) {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
    const hsl = hexToHsl(hex);
    const l = parseFloat(hsl.split(" ")[2]);
    const root = document.documentElement;
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
    root.style.setProperty("--primary-foreground", l > 50 ? "0 0% 9%" : "0 0% 98%");
}

// ─── Onglet Profil ────────────────────────────────────────────────────────────
function ProfileTab({ initialData, onUserUpdate }) {
    const [form, setForm] = useState({
        firstname:     initialData.firstname ?? "",
        lastname:      initialData.lastname ?? "",
        email:         initialData.email ?? "",
        phone:         initialData.phone ?? "",
        dob:           initialData.dob ?? "",
        favoriteColor: initialData.favoriteColor ?? "",
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
            const res = await fetch("/compte/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                onUserUpdate({ firstname: data.firstname, lastname: data.lastname, email: data.email });
                applyPrimaryColor(form.favoriteColor);
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
        <Card>
            <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Modifiez vos informations de profil.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {status && <Alert variant={status}>{message}</Alert>}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <LabeledInput
                            label="Prénom"
                            icon={User}
                            id="firstname"
                            placeholder="Jean"
                            value={form.firstname}
                            onChange={handleChange("firstname")}
                            error={errors.firstname}
                            required
                        />
                        <LabeledInput
                            label="Nom"
                            id="lastname"
                            placeholder="Dupont"
                            value={form.lastname}
                            onChange={handleChange("lastname")}
                            error={errors.lastname}
                            required
                        />
                    </div>

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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <LabeledInput
                            label="Téléphone"
                            icon={Phone}
                            id="phone"
                            type="tel"
                            placeholder="+33 6 00 00 00 00"
                            value={form.phone}
                            onChange={handleChange("phone")}
                            error={errors.phone}
                        />
                        <LabeledInput
                            label="Date de naissance"
                            icon={Calendar}
                            id="dob"
                            type="date"
                            value={form.dob}
                            onChange={handleChange("dob")}
                            error={errors.dob}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="favoriteColor" className="text-sm font-medium text-foreground">
                            Couleur favorite
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="favoriteColor"
                                    type="color"
                                    value={form.favoriteColor || "#000000"}
                                    onChange={handleChange("favoriteColor")}
                                    className="pl-9 w-24 h-9 cursor-pointer"
                                />
                            </div>
                            <span className="text-sm text-muted-foreground">{form.favoriteColor || "Non définie"}</span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Enregistrement…" : "Enregistrer les modifications"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Onglet Sécurité ──────────────────────────────────────────────────────────
function SecurityTab() {
    const [form, setForm]       = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow]       = useState({ current: false, new: false, confirm: false });
    const [errors, setErrors]   = useState({});
    const [status, setStatus]   = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setErrors((err) => ({ ...err, [field]: undefined }));
    };

    const toggleShow = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch("/compte/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

    const PasswordInput = ({ id, field, showKey, label, placeholder, error }) => (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id={id}
                    type={show[showKey] ? "text" : "password"}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={handleChange(field)}
                    className={`pl-9 pr-9 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                />
                <button type="button" onClick={() => toggleShow(showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            <FieldError message={error} />
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>Assurez-vous d'utiliser un mot de passe fort.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {status && <Alert variant={status}>{message}</Alert>}

                    <PasswordInput id="currentPassword" field="currentPassword" showKey="current"
                        label="Mot de passe actuel" placeholder="••••••••" error={errors.currentPassword} />
                    <PasswordInput id="newPassword" field="newPassword" showKey="new"
                        label="Nouveau mot de passe" placeholder="••••••••" error={errors.newPassword} />
                    <PasswordInput id="confirmPassword" field="confirmPassword" showKey="confirm"
                        label="Confirmer le nouveau mot de passe" placeholder="••••••••" error={errors.confirmPassword} />

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Onglet Abonnement ────────────────────────────────────────────────────────
function PlanTab({ plan }) {
    if (!plan) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    Aucun abonnement associé à ce compte.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mon abonnement</CardTitle>
                <CardDescription>Votre formule actuelle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2.5">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{plan.name}</p>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{plan.price}€</p>
                        <p className="text-xs text-muted-foreground">/ mois</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 p-3 rounded-md border border-border">
                        <Zap className="h-4 w-4 text-primary shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Conversions</p>
                            <p className="text-sm font-medium">
                                {plan.limitGeneration === -1 ? "Illimitées" : `${plan.limitGeneration} / jour`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-md border border-border">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Statut</p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Actif</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" asChild>
                        <a href="/abonnement">Changer de formule</a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AccountPage({ userData = {}, tools = [] }) {
    const [user, setUser] = useState({
        firstname: userData.firstname,
        lastname:  userData.lastname,
        email:     userData.email,
    });

    const handleUserUpdate = (updated) => setUser((u) => ({ ...u, ...updated }));

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1 py-12 px-4">
                    <div className="max-w-2xl mx-auto space-y-8">

                        {/* En-tête de page */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shrink-0">
                                {(user.firstname?.[0] ?? "") + (user.lastname?.[0] ?? "")}
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold">{user.firstname} {user.lastname}</h1>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        {/* Onglets */}
                        <Tabs defaultValue="profile">
                            <TabsList className="w-full">
                                <TabsTrigger value="profile" className="flex-1">Profil</TabsTrigger>
                                <TabsTrigger value="security" className="flex-1">Sécurité</TabsTrigger>
                                <TabsTrigger value="plan" className="flex-1">Abonnement</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile" className="mt-6">
                                <ProfileTab initialData={userData} onUserUpdate={handleUserUpdate} />
                            </TabsContent>

                            <TabsContent value="security" className="mt-6">
                                <SecurityTab />
                            </TabsContent>

                            <TabsContent value="plan" className="mt-6">
                                <PlanTab plan={userData.plan} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}