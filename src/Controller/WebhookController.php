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
    #[Route('/payment/webhook', name: 'app_payment_webhook', methods: ['POST'])]
    public function webhook(
        Request $request,
        StripeService $stripeService,
        UserRepository $userRepository,
        PlanRepository $planRepository,
        EntityManagerInterface $em,
    ): Response {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('Stripe-Signature');


        // 1. Vérifier la signature Stripe
        try {
            $event = $stripeService->constructWebhookEvent($payload, $sigHeader);
        } catch (SignatureVerificationException $e) {
            // Signature invalide : rejeter la requête
            return new Response('Signature invalide', Response::HTTP_BAD_REQUEST);
        }


        // 2. Traiter l'événement
        switch ($event->type) {


            case 'checkout.session.completed':
                $session = $event->data->object;


                // Récupérer l'utilisateur et le plan depuis les métadonnées
                $userId = $session->metadata->user_id ?? null;
                $planId = $session->metadata->plan_id ?? null;


                if (!$userId || !$planId) {
                    return new Response('Métadonnées manquantes', Response::HTTP_BAD_REQUEST);
                }


                $user = $userRepository->find($userId);
                $plan = $planRepository->find($planId);


                if (!$user || !$plan) {
                    return new Response('Utilisateur ou plan introuvable', Response::HTTP_NOT_FOUND);
                }


                // Mettre à jour le plan de l'utilisateur
                $user->setPlan($plan);
                $em->flush();


                break;


            case 'customer.subscription.deleted':
                // L'abonnement a été annulé (depuis le Dashboard Stripe ou le portail client)
                // On repasse l'utilisateur sur le plan FREE
                $subscription = $event->data->object;
                $userId = $subscription->metadata->user_id ?? null;


                if ($userId) {
                    $user = $userRepository->find($userId);
                    $freePlan = $planRepository->findOneBy(['name' => 'FREE']);


                    if ($user && $freePlan) {
                        $user->setPlan($freePlan);
                        $em->flush();
                    }
                }
                break;


            // Ignorer les autres événements
            default:
                break;
        }


        // Toujours répondre 200 à Stripe, même si on n'a rien fait
        return new Response('OK', Response::HTTP_OK);
    }
}
