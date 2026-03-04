import React, { useState } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle, ChevronLeft} from "lucide-react";

function FieldError({ errors, field }) {
    const messages = errors?.[field] ?? [];
    if (!messages.length) return null;
    return (
        <ul className="space-y-0.5 mt-1">
            {messages.map((msg, i) => (
                <li key={i} className="flex items-center gap-1 text-xs text-red-500">
                    <XCircle className="h-3 w-3 shrink-0" />
                    {msg}
                </li>
            ))}
        </ul>
    );
}

function PasswordStrength({ password }) {
    if (!password) return null;
    const checks = [
        { label: "6 caractères minimum", ok: password.length >= 6 },
        { label: "Une majuscule", ok: /[A-Z]/.test(password) },
        { label: "Un chiffre", ok: /\d/.test(password) },
    ];
    return (
        <ul className="space-y-1 mt-2">
            {checks.map(({ label, ok }) => (
                <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                    {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {label}
                </li>
            ))}
        </ul>
    );
}

export default function RegisterPage({ plans = [], errors = {}, formData = {}, csrfToken = "" }) {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(formData.plan?.toString() ?? plans[0]?.id?.toString() ?? "");

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
                <div className="w-full max-w-md space-y-6">

                    <div className="text-center">
                        <a href="/">
                            <img src="/images/logo-icon.png" alt="ZenPDF" className="h-10 mx-auto dark:hidden" />
                            <img src="/images/logo-icon-dark.png" alt="ZenPDF" className="h-10 mx-auto hidden dark:block" />
                        </a>
                    </div>

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
                            <CardDescription className="text-center">
                                Rejoignez ZenPDF et convertissez vos fichiers en PDF.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {hasErrors && errors.global && errors.global.map((msg, i) => (
                                <div key={i} className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 px-4 py-3 text-sm">
                                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{msg}</span>
                                </div>
                            ))}

                            <form
                                method="post"
                                action="/register"
                                onSubmit={() => setLoading(true)}
                                className="space-y-4"
                            >
                                <input type="hidden" name="registration_form[_token]" value={csrfToken} />

                                {/* Prénom + Nom */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label htmlFor="firstname" className="text-sm font-medium text-foreground">
                                            Prénom
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="firstname"
                                                name="registration_form[firstname]"
                                                type="text"
                                                placeholder="Jean"
                                                required
                                                autoFocus
                                                defaultValue={formData.firstname ?? ""}
                                                className={`pl-9 ${errors.firstname ? "border-red-500" : ""}`}
                                            />
                                        </div>
                                        <FieldError errors={errors} field="firstname" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="lastname" className="text-sm font-medium text-foreground">
                                            Nom
                                        </label>
                                        <Input
                                            id="lastname"
                                            name="registration_form[lastname]"
                                            type="text"
                                            placeholder="Dupont"
                                            required
                                            defaultValue={formData.lastname ?? ""}
                                            className={errors.lastname ? "border-red-500" : ""}
                                        />
                                        <FieldError errors={errors} field="lastname" />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="registration_form[email]"
                                            type="email"
                                            placeholder="vous@exemple.fr"
                                            required
                                            defaultValue={formData.email ?? ""}
                                            className={`pl-9 ${errors.email ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                    <FieldError errors={errors} field="email" />
                                </div>

                                {/* Plan */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground">
                                        Choisissez votre abonnement
                                    </label>
                                    <input type="hidden" name="registration_form[plan]" value={selectedPlan} required />
                                    <RadioGroup
                                        value={selectedPlan}
                                        onValueChange={setSelectedPlan}
                                        className="grid grid-cols-1 gap-3"
                                    >
                                        {plans.map((plan) => (
                                            <div key={plan.id}>
                                                <RadioGroupItem
                                                    value={plan.id.toString()}
                                                    id={`plan-${plan.id}`}
                                                    className="peer sr-only"
                                                />
                                                <Label
                                                    htmlFor={`plan-${plan.id}`}
                                                    className="flex flex-col items-start justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                                >
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-bold text-base">{plan.name}</span>
                                                            <span className="text-primary font-bold">{plan.price}€</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                            {plan.description}
                                                        </p>
                                                        <div className="text-[10px] font-medium bg-accent/50 px-2 py-0.5 rounded-full w-fit">
                                                            {plan.limit === -1 ? "Illimitées" : `${plan.limit} conversions / jour`}
                                                        </div>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <FieldError errors={errors} field="plan" />
                                </div>

                                {/* Mot de passe */}
                                <div className="space-y-1.5">
                                    <label htmlFor="plainPassword" className="text-sm font-medium text-foreground">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="plainPassword"
                                            name="registration_form[plainPassword]"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className={`pl-9 pr-9 ${errors.plainPassword ? "border-red-500" : ""}`}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <PasswordStrength password={password} />
                                    <FieldError errors={errors} field="plainPassword" />
                                </div>

                                {/* CGU */}
                                <div className="flex items-start gap-2.5">
                                    <input
                                        id="agreeTerms"
                                        name="registration_form[agreeTerms]"
                                        type="checkbox"
                                        value="1"
                                        required
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                                    />
                                    <label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-snug">
                                        J'accepte les{" "}
                                        <a href="/cgu" className="text-foreground underline underline-offset-2 hover:no-underline">
                                            conditions générales d'utilisation
                                        </a>
                                    </label>
                                </div>
                                <FieldError errors={errors} field="agreeTerms" />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading || !agreed || password.length < 6}
                                >
                                    {loading ? "Inscription…" : "Créer mon compte"}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center">
                            <p className="text-sm text-muted-foreground">
                                Déjà un compte ?{" "}
                                <a href="/login" className="text-foreground font-medium hover:underline">
                                    Se connecter
                                </a>
                            </p>
                        </CardFooter>
                    </Card>
                    <div className="text-center">
                        <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 justify-center">
                            <ChevronLeft className='h-4 w-4' />
                            Retour à l'accueil
                        </a>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
