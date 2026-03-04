<?php

namespace App\Controller;

<<<<<<< Updated upstream
=======
use App\Entity\User;
use App\Event\PdfGeneratedEvent;
use App\Repository\ToolRepository;
use App\Security\Voter\GenerationLimitVoter;
use App\Security\Voter\ToolAccessVoter;
use App\Services\ApiGotenberg;
>>>>>>> Stashed changes
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Services\ApiGotenberg;
use App\Repository\ToolRepository;

final class ConvertisseurController extends AbstractController
{
    public function __construct(
        private readonly ApiGotenberg             $pdfService,
        private readonly EventDispatcherInterface $dispatcher,
    ) {
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

<<<<<<< Updated upstream
        return new Response($pdfContent, 200, [
=======
        $slug = $htmlFile ? 'html' : 'url';
        $this->dispatchGeneration($slug, $pdfContent, 'converted.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent);
    }

    // --- LibreOffice single-file (word, excel, powerpoint, image) ---

    #[IsGranted('ROLE_BASIC')]
    #[Route('/convertisseur/word',        name: 'app_convert_word',        methods: ['POST'])]
    #[Route('/convertisseur/excel',       name: 'app_convert_excel',       methods: ['POST'])]
    #[Route('/convertisseur/powerpoint',  name: 'app_convert_powerpoint',  methods: ['POST'])]
    #[Route('/convertisseur/image',       name: 'app_convert_image',       methods: ['POST'])]
    public function convertLibreOffice(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $file = $request->files->get('file');
        if (!$file) {
            return new Response('Aucun fichier fourni.', 400);
        }

        $pdfContent = $this->pdfService->convertLibreOfficeToPdf(
            file_get_contents($file->getPathname()),
            $file->getClientOriginalName(),
            $file->getMimeType() ?? 'application/octet-stream'
        );

        $slug = basename($request->getPathInfo());
        $this->dispatchGeneration($slug, $pdfContent, 'converted.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent);
    }

    // --- Merge ---

    #[IsGranted('ROLE_PREMIUM')]
    #[Route('/convertisseur/merge', name: 'app_convert_merge', methods: ['POST'])]
    public function convertMerge(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $files = $request->files->get('files', []);
        if (empty($files)) {
            return new Response('Aucun fichier fourni.', 400);
        }

        $filesData = array_map(fn($f) => [
            'content'  => file_get_contents($f->getPathname()),
            'filename' => $f->getClientOriginalName(),
            'mimeType' => $f->getMimeType() ?? 'application/pdf',
        ], $files);

        $pdfContent = $this->pdfService->mergeFilesToPdf($filesData);

        $this->dispatchGeneration('merge', $pdfContent, 'merged.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent, 'merged.pdf');
    }

    // --- Split ---

    #[IsGranted('ROLE_PREMIUM')]
    #[Route('/convertisseur/split', name: 'app_convert_split', methods: ['POST'])]
    public function convertSplit(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $file = $request->files->get('file');
        $splitMode = $request->request->get('splitMode', 'intervals');
        $splitSpan = $request->request->get('splitSpan', '1');

        if (!$file) {
            return new Response('Aucun fichier fourni.', 400);
        }

        $pdfContent = $this->pdfService->splitPdf(
            file_get_contents($file->getPathname()),
            $file->getClientOriginalName(),
            $splitMode,
            $splitSpan
        );

        $this->dispatchGeneration('split', $pdfContent, 'split.zip', 'application/zip');

        return new Response($pdfContent, 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="split.zip"',
        ]);
    }

    // --- PDF/A ---

    #[IsGranted('ROLE_PREMIUM')]
    #[Route('/convertisseur/pdfa', name: 'app_convert_pdfa', methods: ['POST'])]
    public function convertPdfA(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $file = $request->files->get('file');
        $standard = $request->request->get('standard', 'PDF/A-2b');

        if (!$file) {
            return new Response('Aucun fichier fourni.', 400);
        }

        $pdfContent = $this->pdfService->convertToPdfA(
            file_get_contents($file->getPathname()),
            $file->getClientOriginalName(),
            $file->getMimeType() ?? 'application/pdf',
            $standard
        );

        $this->dispatchGeneration('pdfa', $pdfContent, 'archived.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent, 'archived.pdf');
    }

    // --- Encrypt ---

    #[IsGranted('ROLE_PREMIUM')]
    #[Route('/convertisseur/encrypt', name: 'app_convert_encrypt', methods: ['POST'])]
    public function convertEncrypt(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $file = $request->files->get('file');
        $userPassword  = $request->request->get('userPassword') ?: null;
        $ownerPassword = $request->request->get('ownerPassword') ?: null;

        if (!$file) {
            return new Response('Aucun fichier fourni.', 400);
        }

        if (!$userPassword && !$ownerPassword) {
            return new Response('Au moins un mot de passe est requis.', 400);
        }

        $pdfContent = $this->pdfService->encryptPdf(
            file_get_contents($file->getPathname()),
            $file->getClientOriginalName(),
            $file->getMimeType() ?? 'application/pdf',
            $userPassword,
            $ownerPassword
        );

        $this->dispatchGeneration('encrypt', $pdfContent, 'encrypted.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent, 'encrypted.pdf');
    }

    private function dispatchGeneration(string $toolSlug, string $content, string $filename, string $mime): void
    {
        /** @var User $user */
        $user = $this->getUser();
        $this->dispatcher->dispatch(new PdfGeneratedEvent($user, $toolSlug, $content, $filename, $mime));
    }

    private function pdfResponse(string $content, string $filename = 'converted.pdf'): Response
    {
        return new Response($content, 200, [
>>>>>>> Stashed changes
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="converted.pdf"',
        ]);
    }
}
