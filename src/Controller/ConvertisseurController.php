<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Services\ApiGotenberg;
use App\Repository\ToolRepository;

final class ConvertisseurController extends AbstractController
{
    private ApiGotenberg $pdfService;

    public function __construct(ApiGotenberg $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    #[Route('/convertisseur', name: 'app_convertisseur', methods: ['GET'])]
    public function index(ToolRepository $toolRepository): Response
    {
        $tools = $toolRepository->findBy(['isActive' => true]);

        $toolsData = array_map(fn($tool) => $this->formatTool($tool), $tools);

        return $this->render('convertisseur/index.html.twig', [
            'tools' => $toolsData,
        ]);
    }

    #[Route('/convertisseur/{slug}', name: 'app_convertisseur_tool', methods: ['GET'])]
    public function show(string $slug, ToolRepository $toolRepository): Response
    {
        $tool = $toolRepository->findOneBy(['slug' => $slug, 'isActive' => true]);

        if (!$tool) {
            throw $this->createNotFoundException('Outil introuvable.');
        }

        $allTools = $toolRepository->findBy(['isActive' => true]);

        return $this->render("convertisseur/{$slug}.html.twig", [
            'tool' => $this->formatTool($tool),
            'allTools' => array_map(fn($t) => $this->formatTool($t), $allTools),
        ]);
    }

    private function formatTool($tool): array
    {
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
    }

    #[Route('/convertisseur', name: 'app_convertisseur_post', methods: ['POST'])]
    public function convert(Request $request): Response
    {
        $url = $request->request->get('url');
        $htmlFile = $request->files->get('htmlFile');

        if ($htmlFile) {
            $htmlContent = file_get_contents($htmlFile->getPathname());
            $pdfContent = $this->pdfService->convertHtmlToPdf($htmlContent);
        } elseif ($url) {
            $pdfContent = $this->pdfService->convertUrlToPdf($url);
        } else {
            return new Response('Veuillez fournir une URL ou un fichier HTML.', 400);
        }

        return new Response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="converted.pdf"',
        ]);
    }
}
