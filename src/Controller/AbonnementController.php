<?php

namespace App\Controller;

use App\Entity\Plan;
use App\Repository\PlanRepository;
use App\Repository\ToolRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

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

        $toolsData = array_map(fn($t) => [
            'id' => $t->getId(),
            'name' => $t->getName(),
            'icon' => $t->getIcon(),
            'description' => $t->getDescription(),
            'slug' => $t->getSlug(),
        ], $allTools);

        /** @var \App\Entity\User|null $user */
        $user = $this->getUser();
        $currentPlanId = $user?->getPlan()?->getId();

        return $this->render('abonnement/index.html.twig', [
            'plans' => $plansData,
            'tools' => $toolsData,
            'currentPlanId' => $currentPlanId,
        ]);
    }

    #[Route('/abonnement/select-plan/{id}', name: 'app_abonnement_select_plan', methods: ['POST'])]
    public function selectPlan(Plan $plan, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var \App\Entity\User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter pour choisir un plan'], Response::HTTP_UNAUTHORIZED);
        }

        $user->setPlan($plan);
        $entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Plan sélectionné avec succès !',
            'planName' => $plan->getName()
        ]);
    }
}
