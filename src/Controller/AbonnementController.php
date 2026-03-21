<?php

namespace App\Controller;

use App\Entity\Plan;
use App\Repository\PlanRepository;
use App\Repository\ToolRepository;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Security\Voter\PlanSelectVoter;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class AbonnementController extends AbstractController
{
    #[Route('/abonnement', name: 'app_abonnement')]
    public function index(PlanRepository $planRepository, ToolRepository $toolRepository): Response
    {
        $plans = $planRepository->findBy(['active' => true], ['price' => 'ASC']);
        $allTools = $toolRepository->findBy(['isActive' => true]);

        $toolsByPlanId = [];
        foreach ($allTools as $tool) {
            foreach ($tool->getPlans() as $plan) {
                $toolsByPlanId[$plan->getId()][] = [
                    'name' => $tool->getName(),
                    'slug' => $tool->getSlug(),
                    'icon' => $tool->getIcon(),
                ];
            }
        }

        $plansData = array_map(function ($plan) use ($toolsByPlanId) {
            return [
                'id' => $plan->getId(),
                'name' => $plan->getName(),
                'description' => $plan->getDescription(),
                'price' => $plan->getPrice(),
                'specialPrice' => $plan->getSpecialPrice(),
                'limitGeneration' => $plan->getLimitGeneration(),
                'tools' => $toolsByPlanId[$plan->getId()] ?? [],
            ];
        }, $plans);

        $toolsData = array_map(function ($t) {
            $minPlan = null;
            foreach ($t->getPlans() as $plan) {
                if ($minPlan === null || $plan->getPrice() < $minPlan->getPrice()) {
                    $minPlan = $plan;
                }
            }
            return [
                'id'          => $t->getId(),
                'name'        => $t->getName(),
                'icon'        => $t->getIcon(),
                'description' => $t->getDescription(),
                'slug'        => $t->getSlug(),
                'minPlan'     => $minPlan ? ['name' => $minPlan->getName(), 'price' => $minPlan->getPrice()] : null,
            ];
        }, $allTools);

        /** @var User|null $user */
        $user = $this->getUser();
        $currentPlanId = $user?->getPlan()?->getId();

        return $this->render('abonnement/index.html.twig', [
            'plans' => $plansData,
            'tools' => $toolsData,
            'currentPlanId' => $currentPlanId,
        ]);
    }

    #[IsGranted('ROLE_USER')]
    #[Route('/abonnement/checkout/{id}', name: 'app_abonnement_checkout', methods: ['GET'])]
    public function checkout(Plan $plan, StripeService $stripeService, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        [$customerId, $isNew] = $stripeService->getOrCreateCustomer($user);

        if ($isNew) {
            $user->setStripeCustomerId($customerId);
            $em->flush();
        }

        $successUrl = $this->generateUrl('app_abonnement_success', [], UrlGeneratorInterface::ABSOLUTE_URL);
        $cancelUrl  = $this->generateUrl('app_abonnement_cancel', [], UrlGeneratorInterface::ABSOLUTE_URL);

        if (!$plan->getStripePriceId()) {
            throw $this->createNotFoundException('Ce plan n\'a pas de prix Stripe configuré.');
        }

        $checkoutUrl = $stripeService->createCheckoutSession($user, $plan, $successUrl, $cancelUrl, $customerId);

        return $this->redirect($checkoutUrl);
    }

    #[IsGranted('ROLE_USER')]
    #[Route('/abonnement/portal', name: 'app_abonnement_portal', methods: ['GET'])]
    public function portal(StripeService $stripeService, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user->getStripeCustomerId()) {
            [$customerId, $isNew] = $stripeService->getOrCreateCustomer($user);
            if ($isNew) {
                $user->setStripeCustomerId($customerId);
                $em->flush();
            }
        }

        $returnUrl = $this->generateUrl('app_compte', [], UrlGeneratorInterface::ABSOLUTE_URL);
        $portalUrl = $stripeService->createPortalSession($user, $returnUrl);

        return $this->redirect($portalUrl);
    }

    #[Route('/abonnement/success', name: 'app_abonnement_success')]
    public function success(): Response
    {
        return $this->render('abonnement/success.html.twig');
    }

    #[Route('/abonnement/cancel', name: 'app_abonnement_cancel')]
    public function cancel(): Response
    {
        return $this->render('abonnement/cancel.html.twig');
    }

    #[IsGranted('ROLE_USER')]
    #[Route('/abonnement/select-plan/{id}', name: 'app_abonnement_select_plan', methods: ['POST'])]
    public function selectPlan(Plan $plan, EntityManagerInterface $entityManager, Security $security): JsonResponse
    {
        $this->denyAccessUnlessGranted(PlanSelectVoter::SELECT, $plan);

        /** @var User $user */
        $user = $this->getUser();

        $user->setPlan($plan);

        $planRole = $plan->getRole();
        $user->setRoles($planRole ? [$planRole] : []);

        $entityManager->flush();

        // Rafraîchit le token de sécurité pour appliquer les nouveaux rôles immédiatement
        $security->login($user, 'form_login', 'main');

        return $this->json([
            'success' => true,
            'message' => 'Plan sélectionné avec succès !',
            'planName' => $plan->getName()
        ]);
    }
}
