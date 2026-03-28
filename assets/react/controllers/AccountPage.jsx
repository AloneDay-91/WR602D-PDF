import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { icons as lucideIcons,
    User, Mail, Phone, Calendar, Palette, Lock, Eye, EyeOff,
    CheckCircle, XCircle, Zap, CreditCard, ShieldCheck,
    FileText, Download, ExternalLink, Settings2,
    LayoutDashboard, KeyRound, Receipt, ChevronRight,
    Sparkles, TrendingUp, Crown,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    const parts  = hsl.split(" ");
    const hDeg   = parseInt(parts[0]);
    const sPct   = parseInt(parts[1]);
    const lPct   = parseInt(parts[2]);
    const dark   = document.documentElement.classList.contains("dark");
    const fg     = lPct > 50 ? "0 0% 9%" : "0 0% 98%";
    const accentL  = dark ? Math.min(lPct, 15) : Math.max(lPct, 92);
    const accentFg = dark ? Math.max(lPct, 70) : Math.min(lPct, 25);
    const root = document.documentElement;
    root.style.setProperty("--primary",            hsl);
    root.style.setProperty("--ring",               hsl);
    root.style.setProperty("--primary-foreground", fg);
    root.style.setProperty("--accent",             `${hDeg} ${sPct}% ${accentL}%`);
    root.style.setProperty("--accent-foreground",  `${hDeg} ${sPct}% ${accentFg}%`);
    root.style.setProperty("--sidebar-primary",    hsl);
    root.style.setProperty("--sidebar-ring",       hsl);
}

function resetPrimaryColor() {
    const root = document.documentElement;
    ["--primary","--ring","--primary-foreground","--accent","--accent-foreground","--sidebar-primary","--sidebar-ring"]
        .forEach(p => root.style.removeProperty(p));
}

function planIcon(planName) {
    if (!planName) return <User className="h-4 w-4" />;
    const n = planName.toUpperCase();
    if (n === "PREMIUM") return <Crown className="h-4 w-4" />;
    if (n === "BASIC")   return <Sparkles className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
}

// ─── Micro-composants ─────────────────────────────────────────────────────────
function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-destructive mt-1">
            <XCircle className="h-3 w-3 shrink-0" />{message}
        </p>
    );
}

function FormAlert({ variant, children }) {
    if (!children) return null;
    const ok = variant === "success";
    return (
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            ok  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300"
                : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}>
            {ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            <span>{children}</span>
        </div>
    );
}

function LabeledInput({ label, icon: Icon, id, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                <Input
                    id={id}
                    className={`${Icon ? "pl-9" : ""} ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...props}
                />
            </div>
            <FieldError message={error} />
        </div>
    );
}

function InvoiceStatusBadge({ status }) {
    const map = {
        paid:          { label: "Payée",      variant: "outline", extra: "text-green-600 border-green-300 dark:text-green-400 dark:border-green-700" },
        open:          { label: "En attente", variant: "outline", extra: "text-yellow-600 border-yellow-300 dark:text-yellow-400 dark:border-yellow-700" },
        void:          { label: "Annulée",    variant: "secondary", extra: "" },
        uncollectible: { label: "Impayée",    variant: "destructive", extra: "" },
    };
    const s = map[status] ?? { label: status, variant: "secondary", extra: "" };
    return <Badge variant={s.variant} className={s.extra}>{s.label}</Badge>;
}

// ─── Section Profil ───────────────────────────────────────────────────────────
function ProfileSection({ initialData, onUserUpdate }) {
    const [form, setForm] = useState({
        firstname:     initialData.firstname ?? "",
        lastname:      initialData.lastname ?? "",
        email:         initialData.email ?? "",
        phone:         initialData.phone ?? "",
        dob:           initialData.dob ?? "",
        favoriteColor: initialData.favoriteColor ?? "",
    });
    const [errors, setErrors]   = useState({});
    const [status, setStatus]   = useState(null);
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
            const res  = await fetch("/compte/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
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
        } catch { setStatus("error"); setMessage("Une erreur est survenue. Réessayez."); }
        finally   { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Informations personnelles</h2>
                <p className="text-sm text-muted-foreground">Mettez à jour vos informations de profil.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {status && <FormAlert variant={status}>{message}</FormAlert>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <LabeledInput label="Prénom" icon={User} id="firstname" placeholder="Jean"
                        value={form.firstname} onChange={handleChange("firstname")} error={errors.firstname} required />
                    <LabeledInput label="Nom" id="lastname" placeholder="Dupont"
                        value={form.lastname} onChange={handleChange("lastname")} error={errors.lastname} required />
                </div>

                <LabeledInput label="Adresse email" icon={Mail} id="email" type="email" placeholder="vous@exemple.fr"
                    value={form.email} onChange={handleChange("email")} error={errors.email} required />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <LabeledInput label="Téléphone" icon={Phone} id="phone" type="tel" placeholder="+33 6 00 00 00 00"
                        value={form.phone} onChange={handleChange("phone")} error={errors.phone} />
                    <LabeledInput label="Date de naissance" icon={Calendar} id="dob" type="date"
                        value={form.dob} onChange={handleChange("dob")} error={errors.dob} />
                </div>

                {/* Couleur favorite */}
                <div className="space-y-1.5">
                    <Label htmlFor="favoriteColor">Couleur d'accentuation</Label>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input id="favoriteColor" type="color"
                                value={form.favoriteColor || "#000000"}
                                onChange={handleChange("favoriteColor")}
                                className="pl-9 w-24 h-9 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: form.favoriteColor || "transparent" }} />
                            <span className="text-sm text-muted-foreground font-mono">{form.favoriteColor || "Non définie"}</span>
                        </div>
                        {form.favoriteColor && (
                            <Button type="button" variant="ghost" size="sm"
                                onClick={() => { setForm(f => ({ ...f, favoriteColor: "" })); resetPrimaryColor(); }}>
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">Personnalise la couleur principale de l'interface.</p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Enregistrement…" : "Sauvegarder les modifications"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Section Sécurité ─────────────────────────────────────────────────────────
function SecuritySection() {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const res  = await fetch("/compte/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const data = await res.json();
            if (res.ok) { setStatus("success"); setMessage(data.message); setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
            else         { setErrors(data.errors ?? {}); setStatus("error"); setMessage("Veuillez corriger les erreurs."); }
        } catch { setStatus("error"); setMessage("Une erreur est survenue."); }
        finally   { setLoading(false); }
    };

    const PwInput = ({ id, field, showKey, label, placeholder, error }) => (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id={id} type={show[showKey] ? "text" : "password"} placeholder={placeholder}
                    value={form[field]} onChange={handleChange(field)}
                    className={`pl-9 pr-9 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`} required />
                <button type="button" tabIndex={-1} onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            <FieldError message={error} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Sécurité du compte</h2>
                <p className="text-sm text-muted-foreground">Mettez à jour votre mot de passe régulièrement.</p>
            </div>

            {/* Info card sécurité */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-medium text-foreground">Conseils de sécurité</p>
                    <p className="text-muted-foreground mt-0.5">Utilisez au moins 8 caractères, incluant lettres, chiffres et symboles.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {status && <FormAlert variant={status}>{message}</FormAlert>}
                <PwInput id="currentPassword" field="currentPassword" showKey="current"
                    label="Mot de passe actuel" placeholder="••••••••" error={errors.currentPassword} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <PwInput id="newPassword" field="newPassword" showKey="new"
                        label="Nouveau mot de passe" placeholder="••••••••" error={errors.newPassword} />
                    <PwInput id="confirmPassword" field="confirmPassword" showKey="confirm"
                        label="Confirmer le mot de passe" placeholder="••••••••" error={errors.confirmPassword} />
                </div>
                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Section Abonnement ───────────────────────────────────────────────────────
function accessibleTools(tools, planName) {
    const rank = { FREE: 0, BASIC: 1, PREMIUM: 2 };
    const userRank = rank[planName] ?? 0;
    return tools.filter((t) => (rank[t.minPlan?.name] ?? 0) <= userRank);
}

function BillingSection({ plan, generationsToday = 0, invoices = [], hasStripeCustomer = false, tools = [] }) {
    if (!plan) return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Abonnement & Facturation</h2>
                <p className="text-sm text-muted-foreground">Gérez votre formule et vos factures.</p>
            </div>
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
                Aucun abonnement associé à ce compte.
            </div>
        </div>
    );

    const isUnlimited = plan.limitGeneration <= 0;
    const used        = generationsToday;
    const limit       = plan.limitGeneration;
    const percent     = isUnlimited ? 100 : Math.min(100, Math.round((used / limit) * 100));
    const remaining   = isUnlimited ? null : limit - used;
    const isFull      = !isUnlimited && used >= limit;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-semibold">Abonnement & Facturation</h2>
                <p className="text-sm text-muted-foreground">Gérez votre formule et consultez vos factures.</p>
            </div>

            {/* Plan actuel */}
            <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/15 p-2.5">
                            {planIcon(plan.name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{plan.name}</p>
                                <Badge variant="secondary" className="text-xs">Actif</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-2xl font-bold">{plan.price.toLocaleString("fr-FR")}€</p>
                        <p className="text-xs text-muted-foreground">/ mois</p>
                    </div>
                </div>

                {/* Compteur */}
                <div className="p-5 space-y-3 border-t border-border bg-card">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>Conversions aujourd'hui</span>
                        </div>
                        <span className={`font-semibold tabular-nums ${isFull ? "text-destructive" : ""}`}>
                            {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isFull ? "bg-destructive" : percent >= 80 ? "bg-orange-500" : "bg-primary"
                            }`}
                            style={{ width: `${isUnlimited ? 100 : percent}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isUnlimited
                            ? "Conversions illimitées incluses dans votre plan."
                            : isFull
                                ? "Limite atteinte — réinitialisée demain à minuit."
                                : `${remaining} conversion${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} aujourd'hui.`}
                    </p>
                </div>
            </div>

            {/* Outils */}
            {tools.length > 0 && (() => {
                const rank = { FREE: 0, BASIC: 1, PREMIUM: 2 };
                const userRank = rank[plan.name] ?? 0;
                return (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold">
                            Outils disponibles
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                ({accessibleTools(tools, plan.name).length}/{tools.length})
                            </span>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {tools.map((t) => {
                                const accessible = (rank[t.minPlan?.name] ?? 0) <= userRank;
                                const Icon = accessible
                                    ? (lucideIcons[t.icon] ?? lucideIcons.Wrench)
                                    : Lock;
                                if (accessible) {
                                    return (
                                        <a
                                            key={t.id}
                                            href={`/convertisseur/${t.slug}`}
                                            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm hover:border-primary/40 hover:bg-accent transition-colors group"
                                        >
                                            <div className="rounded-md bg-primary/10 p-1.5 shrink-0 group-hover:bg-primary/20 transition-colors">
                                                <Icon className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <span className="font-medium text-xs truncate">{t.name}</span>
                                        </a>
                                    );
                                }
                                return (
                                    <div
                                        key={t.id}
                                        className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm opacity-50 cursor-not-allowed"
                                    >
                                        <div className="rounded-md bg-muted p-1.5 shrink-0">
                                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <span className="font-medium text-xs truncate">{t.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Actions */}
            <div className="flex justify-end flex-wrap gap-3">
                <Button variant="default" size='sm' asChild>
                    <a href="/abonnement">Changer de formule</a>
                </Button>
                {hasStripeCustomer && (
                    <Button variant="destructive" size='sm' asChild>
                        <a href="/abonnement/portal">
                            <Settings2 className="mr-2 h-4 w-4" />
                            Gérer / Annuler l'abonnement
                        </a>
                    </Button>
                )}
            </div>

            {/* Factures */}
            {invoices.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Historique de facturation</h3>
                    </div>
                    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                        {invoices.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{inv.number ?? inv.id}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(inv.date * 1000).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                                        {inv.description ? ` — ${inv.description}` : ""}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    <InvoiceStatusBadge status={inv.status} />
                                    <span className="text-sm font-semibold tabular-nums">
                                        {inv.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {inv.currency}
                                    </span>
                                    <div className="flex gap-1.5">
                                        {inv.pdfUrl && (
                                            <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer"
                                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Télécharger">
                                                <Download className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                        {inv.hostedUrl && (
                                            <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer"
                                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Voir en ligne">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Nav items sidebar ────────────────────────────────────────────────────────
const NAV = [
    { key: "profile",  label: "Profil",       icon: LayoutDashboard, desc: "Informations personnelles" },
    { key: "security", label: "Sécurité",      icon: KeyRound,        desc: "Mot de passe" },
    { key: "billing",  label: "Abonnement",    icon: Receipt,         desc: "Plan & Facturation" },
];

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AccountPage({ userData = {}, tools = [] }) {
    const [activeTab, setActiveTab] = useState("profile");
    const [user, setUser] = useState({
        firstname:        userData.firstname,
        lastname:         userData.lastname,
        email:            userData.email,
        generationsToday: userData.generationsToday ?? 0,
        limitGeneration:  userData.plan?.limitGeneration ?? 0,
        isBasic:          userData.isBasic ?? false,
        isPremium:        userData.isPremium ?? false,
        plan:             userData.plan ?? null,
    });

    const invoices         = userData.invoices ?? [];
    const hasStripeCustomer = userData.hasStripeCustomer ?? false;
    const initials         = `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase();
    const plan             = userData.plan;

    const handleUserUpdate = (updated) => setUser((u) => ({ ...u, ...updated }));

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1">
                    {/* ── Banner hero ── */}
                    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                        <div className="relative max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-background">
                                    {initials || <User className="h-8 w-8" />}
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background" />
                            </div>

                            {/* Identité */}
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-2xl font-bold">{user.firstname} {user.lastname}</h1>
                                <p className="text-muted-foreground text-sm">{user.email}</p>
                                {plan && (
                                    <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                                        <Badge variant="secondary" className="gap-1 text-xs">
                                            {planIcon(plan.name)}
                                            {plan.name}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Stats rapides */}
                            <div className="flex gap-3 shrink-0">
                                <StatPill
                                    label="Conversions"
                                    value={user.limitGeneration <= 0 ? "∞" : `${user.generationsToday}/${user.limitGeneration}`}
                                    icon={<TrendingUp className="h-3.5 w-3.5" />}
                                />
                                <StatPill
                                    label="Statut"
                                    value="Actif"
                                    icon={<ShieldCheck className="h-3.5 w-3.5" />}
                                    green
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Layout sidebar + contenu ── */}
                    <div className="max-w-5xl mx-auto px-6 py-10">
                        <div className="flex flex-col md:flex-row gap-8">

                            {/* Sidebar */}
                            <aside className="w-full md:w-56 shrink-0">
                                <nav className="space-y-1">
                                    {NAV.map(({ key, label, icon: Icon, desc }) => {
                                        const active = activeTab === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setActiveTab(key)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                                                    active
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${active ? "text-primary-foreground" : ""}`}>{label}</p>
                                                    <p className={`text-xs truncate ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{desc}</p>
                                                </div>
                                                <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${active ? "translate-x-0.5 text-primary-foreground" : "opacity-0 group-hover:opacity-100"}`} />
                                            </button>
                                        );
                                    })}
                                </nav>

                                {/* Plan card sidebar */}
                                {plan && (
                                    <Card className="mt-6 border-primary/20 bg-primary/5">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-primary" />
                                                <p className="text-sm font-medium">Mon plan</p>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold">{plan.name}</p>
                                                <p className="text-sm text-muted-foreground">{plan.price.toLocaleString("fr-FR")}€ / mois</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                                                <a href="/abonnement">Changer de formule</a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </aside>

                            {/* Contenu principal */}
                            <div className="flex-1 min-w-0">
                                <Card className="shadow-sm">
                                    <CardContent className="p-6 sm:p-8">
                                        {activeTab === "profile"  && <ProfileSection  initialData={userData} onUserUpdate={handleUserUpdate} />}
                                        {activeTab === "security" && <SecuritySection />}
                                        {activeTab === "billing"  && (
                                            <BillingSection
                                                plan={plan}
                                                generationsToday={userData.generationsToday ?? 0}
                                                invoices={invoices}
                                                hasStripeCustomer={hasStripeCustomer}
                                                tools={tools}
                                            />
                                        )}
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

function StatPill({ label, value, icon, green = false }) {
    return (
        <div className="flex flex-col items-center gap-0.5 bg-background/60 backdrop-blur border border-border rounded-xl px-4 py-2.5 min-w-[90px]">
            <div className={`flex items-center gap-1 text-xs ${green ? "text-green-500" : "text-primary"}`}>
                {icon}
                <span className="font-semibold tabular-nums">{value}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
    );
}
