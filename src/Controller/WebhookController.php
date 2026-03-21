<?php

namespace App\Controller;

use App\Repository\PlanRepository;
use App\Repository\UserRepository;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Exception\SignatureVerificationException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class WebhookController extends AbstractController
{
    public function __construct(
        private readonly StripeService $stripeService,
        private readonly UserRepository $userRepository,
        private readonly PlanRepository $planRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('/payment/webhook', name: 'app_payment_webhook', methods: ['POST'])]
    public function webhook(Request $request): Response
    {
        $payload   = $request->getContent();
        $sigHeader = $request->headers->get('Stripe-Signature');

        try {
            $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);
        } catch (SignatureVerificationException) {
            return new Response('Signature invalide', Response::HTTP_BAD_REQUEST);
        }

        $error = match ($event->type) {
            'checkout.session.completed'     => $this->handleCheckoutCompleted($event->data->object),
            'customer.subscription.deleted'  => $this->handleSubscriptionDeleted($event->data->object),
            default                          => null,
        };

        return $error ?? new Response('OK', Response::HTTP_OK);
    }

    private function handleCheckoutCompleted(object $session): ?Response
    {
        $userId = $session->metadata->user_id ?? null;
        $planId = $session->metadata->plan_id ?? null;

        if (!$userId || !$planId) {
            return new Response('Métadonnées manquantes', Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->find($userId);
        $plan = $this->planRepository->find($planId);

        if (!$user || !$plan) {
            return new Response('Utilisateur ou plan introuvable', Response::HTTP_NOT_FOUND);
        }

        $user->setPlan($plan);
        $this->em->flush();

        return null;
    }

    private function handleSubscriptionDeleted(object $subscription): ?Response
    {
        $userId = $subscription->metadata->user_id ?? null;
        if (!$userId) {
            return null;
        }

        $user     = $this->userRepository->find($userId);
        $freePlan = $this->planRepository->findOneBy(['name' => 'FREE']);

        if ($user && $freePlan) {
            $user->setPlan($freePlan);
            $this->em->flush();
        }

        return null;
    }
}
