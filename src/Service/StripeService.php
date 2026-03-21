<?php

namespace App\Service;

use App\Entity\Plan;
use App\Entity\User;
use Stripe\BillingPortal\Session as PortalSession;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Invoice;
use Stripe\Stripe;
use Stripe\Webhook;

/**
 * @SuppressWarnings(PHPMD.StaticAccess)
 */
class StripeService
{
    public function __construct(
        private string $secretKey,
        private string $webhookSecret,
    ) {
        Stripe::setApiKey($this->secretKey);
    }

    /**
     * Crée une Checkout Session Stripe pour l'abonnement à un plan.
     * Retourne l'URL vers laquelle rediriger l'utilisateur.
     */
    /**
     * Retourne l'ID du customer Stripe existant ou en crée un nouveau.
     * Retourne aussi un booléen indiquant si le customer vient d'être créé.
     */
    public function getOrCreateCustomer(User $user): array
    {
        if ($user->getStripeCustomerId()) {
            return [$user->getStripeCustomerId(), false];
        }

        $customer = Customer::create([
            'email' => $user->getEmail(),
            'name'  => $user->getFirstname() . ' ' . $user->getLastname(),
            'metadata' => ['user_id' => $user->getId()],
        ]);

        return [$customer->id, true];
    }

    /**
     * Crée une Checkout Session Stripe pour l'abonnement à un plan.
     * Retourne l'URL vers laquelle rediriger l'utilisateur.
     */
    public function createCheckoutSession(
        User $user,
        Plan $plan,
        string $successUrl,
        string $cancelUrl,
        string $customerId,
    ): string {
        $session = Session::create([
            'mode'       => 'subscription',
            'customer'   => $customerId,
            'line_items' => [[
                'price'    => $plan->getStripePriceId(),
                'quantity' => 1,
            ]],
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'  => $cancelUrl,
            'metadata'    => [
                'user_id' => $user->getId(),
                'plan_id' => $plan->getId(),
            ],
            'subscription_data' => [
                'metadata' => [
                    'user_id' => $user->getId(),
                    'plan_id' => $plan->getId(),
                ],
            ],
        ]);

        return $session->url;
    }

    /**
     * Crée une session du portail de facturation Stripe (gestion abonnement, annulation, factures).
     */
    public function createPortalSession(User $user, string $returnUrl): string
    {
        $session = PortalSession::create([
            'customer'   => $user->getStripeCustomerId(),
            'return_url' => $returnUrl,
        ]);

        return $session->url;
    }

    /**
     * Retourne les dernières factures Stripe du customer.
     */
    public function getInvoices(User $user, int $limit = 10): array
    {
        if (!$user->getStripeCustomerId()) {
            return [];
        }

        $invoices = Invoice::all([
            'customer' => $user->getStripeCustomerId(),
            'limit'    => $limit,
        ]);

        return array_map(fn($inv) => [
            'id'          => $inv->id,
            'number'      => $inv->number,
            'date'        => $inv->created,
            'amount'      => $inv->amount_paid / 100,
            'currency'    => strtoupper($inv->currency),
            'status'      => $inv->status,
            'pdfUrl'      => $inv->invoice_pdf,
            'hostedUrl'   => $inv->hosted_invoice_url,
            'description' => $inv->lines->data[0]->description ?? null,
        ], $invoices->data);
    }

    /**
     * Vérifie la signature du webhook Stripe et retourne l'événement.
     * Lève une exception si la signature est invalide.
     */
    public function constructWebhookEvent(string $payload, string $sigHeader): \Stripe\Event
    {
        return Webhook::constructEvent($payload, $sigHeader, $this->webhookSecret);
    }
}
