<?php

namespace App\Controller;

use App\Repository\PlanRepository;
use App\Repository\ToolRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(PlanRepository $planRepository, ToolRepository $toolRepository): Response
    {
        $plans = $planRepository->findBy(['active' => true], ['price' => 'ASC']);
        $tools = $toolRepository->findBy(['isActive' => true]);

        $plansData = array_map(function ($plan) {
            return [
                'id' => $plan->getId(),
                'name' => $plan->getName(),
                'description' => $plan->getDescription(),
                'price' => $plan->getPrice(),
                'specialPrice' => $plan->getSpecialPrice(),
                'limitGeneration' => $plan->getLimitGeneration(),
                'image' => $plan->getImage(),
            ];
        }, $plans);

        $toolsData = array_map(function ($tool) {
            $minPlan = null;
            foreach ($tool->getPlans() as $plan) {
                if ($minPlan === null || $plan->getPrice() < $minPlan->getPrice()) {
                    $minPlan = $plan;
                }
            }

            return [
                'id' => $tool->getId(),
                'name' => $tool->getName(),
                'icon' => $tool->getIcon(),
                'description' => $tool->getDescription(),
                'color' => $tool->getColor(),
                'slug' => $tool->getSlug(),
                'minPlan' => $minPlan ? ['name' => $minPlan->getName(), 'price' => $minPlan->getPrice()] : null,
            ];
        }, $tools);

        return $this->render('home/index.html.twig', [
            'plans' => $plansData,
            'tools' => $toolsData,
        ]);
    }
}