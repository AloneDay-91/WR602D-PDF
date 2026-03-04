<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\GenerationRepository;
use App\Repository\ToolRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

final class HistoriqueController extends AbstractController
{
    public function __construct(private readonly string $projectDir)
    {
    }

    #[Route('/historique', name: 'app_historique')]
    public function index(GenerationRepository $generationRepository, ToolRepository $toolRepository): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $generations = array_map(fn($g) => [
            'id'               => $g->getId(),
            'toolSlug'         => $g->getFile(),
            'createdAt'        => $g->getCreateadAt()?->format('c'),
            'originalFilename' => $g->getOriginalFilename(),
            'mimeType'         => $g->getMimeType(),
            'downloadUrl'      => $g->getStoredFilename()
                ? $this->generateUrl('app_historique_download', ['id' => $g->getId()])
                : null,
        ], $generationRepository->findByUserOrderedDesc($user));

        $tools = array_map(function ($tool) {
            $minPlan = null;
            foreach ($tool->getPlans() as $plan) {
                if ($minPlan === null || $plan->getPrice() < $minPlan->getPrice()) {
                    $minPlan = $plan;
                }
            }
            return [
                'id'          => $tool->getId(),
                'name'        => $tool->getName(),
                'icon'        => $tool->getIcon(),
                'description' => $tool->getDescription(),
                'slug'        => $tool->getSlug(),
                'minPlan'     => $minPlan ? ['name' => $minPlan->getName(), 'price' => $minPlan->getPrice()] : null,
            ];
        }, $toolRepository->findBy(['isActive' => true]));

        return $this->render('historique/index.html.twig', [
            'generations' => $generations,
            'tools'       => $tools,
        ]);
    }

    #[Route('/historique/{id}/download', name: 'app_historique_download', methods: ['GET'])]
    public function download(int $id, GenerationRepository $generationRepository): Response
    {
        /** @var User $user */
        $user       = $this->getUser();
        $generation = $generationRepository->find($id);

        if (!$generation) {
            throw $this->createNotFoundException();
        }

        if ($generation->getUser()?->getId() !== $user->getId()) {
            throw $this->createAccessDeniedException();
        }

        $storedFilename = $generation->getStoredFilename();
        if (!$storedFilename) {
            throw $this->createNotFoundException('Fichier non disponible.');
        }

        $path = $this->projectDir . '/var/pdf_storage/' . $user->getId() . '/' . $storedFilename;

        if (!file_exists($path)) {
            throw $this->createNotFoundException('Fichier introuvable sur le serveur.');
        }

        $response = new BinaryFileResponse($path);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $generation->getOriginalFilename() ?? $storedFilename,
        );
        $response->headers->set('Content-Type', $generation->getMimeType() ?? 'application/octet-stream');

        return $response;
    }
}
