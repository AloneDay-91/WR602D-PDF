<?php

namespace App\Controller;

use App\Entity\QueueEntry;
use App\Entity\User;
use App\Event\PdfGeneratedEvent;
use App\Repository\ToolRepository;
use App\Security\Voter\GenerationLimitVoter;
use App\Security\Voter\ToolAccessVoter;
use App\Services\ApiGotenberg;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use DateTimeImmutable;

/**
 * @SuppressWarnings(PHPMD.TooManyPublicMethods)
 */
#[IsGranted('ROLE_USER')]
final class ConvertisseurController extends AbstractController
{
    public function __construct(
        private readonly ApiGotenberg $pdfService,
        private readonly EventDispatcherInterface $dispatcher,
        private readonly EntityManagerInterface $em,
        private readonly string $projectDir,
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

    #[IsGranted('ROLE_USER')]
    #[Route('/convertisseur/url', name: 'app_convertisseur_url', methods: ['GET'])]
    public function showUrl(ToolRepository $toolRepository): Response
    {
        return $this->showTool('url', $toolRepository);
    }

    #[IsGranted('ROLE_BASIC')]
    #[Route('/convertisseur/html', name: 'app_convertisseur_html', methods: ['GET'])]
    public function showHtml(ToolRepository $toolRepository): Response
    {
        return $this->showTool('html', $toolRepository);
    }

    #[Route('/convertisseur/{slug}', name: 'app_convertisseur_tool', methods: ['GET'])]
    public function show(string $slug, ToolRepository $toolRepository): Response
    {
        return $this->showTool($slug, $toolRepository);
    }

    private function showTool(string $slug, ToolRepository $toolRepository): Response
    {
        $tool = $toolRepository->findOneBy(['slug' => $slug, 'isActive' => true]);

        if (!$tool) {
            throw $this->createNotFoundException('Outil introuvable.');
        }

        $this->denyAccessUnlessGranted(ToolAccessVoter::ACCESS, $tool);

        $allTools = $toolRepository->findBy(['isActive' => true]);

        return $this->render("convertisseur/$slug.html.twig", [
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

    // --- URL → PDF ---

    #[IsGranted('ROLE_USER')]
    #[Route('/convertisseur/url', name: 'app_convertisseur_url_post', methods: ['POST'])]
    public function convertUrl(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $url = $request->request->get('url');
        if (!$url) {
            return new Response('Veuillez fournir une URL.', 400);
        }

        $pdfContent = $this->pdfService->convertUrlToPdf($url);
        $this->dispatchGeneration('url', $pdfContent, 'converted.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent);
    }

    // --- HTML → PDF ---

    #[IsGranted('ROLE_BASIC')]
    #[Route('/convertisseur', name: 'app_convertisseur_post', methods: ['POST'])]
    public function convert(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $htmlFile = $request->files->get('htmlFile');

        if (!$htmlFile) {
            return new Response('Veuillez fournir un fichier HTML.', 400);
        }

        $htmlContent = file_get_contents($htmlFile->getPathname());
        $pdfContent  = $this->pdfService->convertHtmlToPdf($htmlContent);

        $this->dispatchGeneration('html', $pdfContent, 'converted.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent);
    }

    // --- Markdown → PDF ---

    #[IsGranted('ROLE_BASIC')]
    #[Route('/convertisseur/markdown', name: 'app_convert_markdown', methods: ['POST'])]
    public function convertMarkdown(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $file = $request->files->get('file');
        if (!$file) {
            return new Response('Aucun fichier fourni.', 400);
        }

        $pdfContent = $this->pdfService->convertMarkdownToPdf(
            file_get_contents($file->getPathname()),
            $file->getClientOriginalName()
        );

        $this->dispatchGeneration('markdown', $pdfContent, 'converted.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent);
    }

    // --- Screenshot URL → PNG ---

    #[IsGranted('ROLE_BASIC')]
    #[Route('/convertisseur/screenshot', name: 'app_convert_screenshot', methods: ['POST'])]
    public function convertScreenshot(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $url = $request->request->get('url');
        if (!$url) {
            return new Response('Veuillez fournir une URL.', 400);
        }

        $imgContent = $this->pdfService->screenshotUrl($url);
        $this->dispatchGeneration('screenshot', $imgContent, 'screenshot.png', 'image/png');

        return new Response($imgContent, 200, [
            'Content-Type'        => 'image/png',
            'Content-Disposition' => 'attachment; filename="screenshot.png"',
        ]);
    }

    // --- WYSIWYG → PDF ---

    #[IsGranted('ROLE_BASIC')]
    #[Route('/convertisseur/wysiwyg', name: 'app_convert_wysiwyg', methods: ['POST'])]
    public function convertWysiwyg(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $htmlContent = $request->request->get('htmlContent', '');
        if (empty(trim(strip_tags($htmlContent)))) {
            return new Response('Le contenu est vide.', 400);
        }

        $pdfContent = $this->pdfService->convertWysiwygToPdf($htmlContent);
        $this->dispatchGeneration('wysiwyg', $pdfContent, 'document.pdf', 'application/pdf');

        return $this->pdfResponse($pdfContent, 'document.pdf');
    }

    // --- LibreOffice single-file (word, excel, powerpoint, image) ---

    #[IsGranted('ROLE_BASIC')]
    #[Route('/convertisseur/word', name: 'app_convert_word', methods: ['POST'])]
    #[Route('/convertisseur/excel', name: 'app_convert_excel', methods: ['POST'])]
    #[Route('/convertisseur/powerpoint', name: 'app_convert_powerpoint', methods: ['POST'])]
    #[Route('/convertisseur/image', name: 'app_convert_image', methods: ['POST'])]
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

    // --- Merge (via queue) ---

    #[IsGranted('ROLE_PREMIUM')]
    #[Route('/convertisseur/merge', name: 'app_convert_merge', methods: ['POST'])]
    public function convertMerge(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $files = $request->files->get('files', []);
        if (empty($files)) {
            return new JsonResponse(['error' => 'Aucun fichier fourni.'], 400);
        }

        /** @var User $user */
        $user     = $this->getUser();
        $queueDir = $this->projectDir . '/var/queue_storage/' . bin2hex(random_bytes(8));

        if (!is_dir($queueDir)) {
            mkdir($queueDir, 0755, true);
        }

        foreach ($files as $file) {
            $safeName = bin2hex(random_bytes(4)) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
            $file->move($queueDir, $safeName);
        }

        $entry = new QueueEntry();
        $entry->setUser($user);
        $entry->setFilesDir($queueDir);
        $entry->setStatus('pending');
        $entry->setCreatedAt(new DateTimeImmutable());

        $this->em->persist($entry);
        $this->em->flush();

        return new JsonResponse([
            'status'  => 'queued',
            'message' => 'Votre demande de fusion a été ajoutée à la file d\'attente. Vous recevrez un email une fois le traitement terminé.',
            'entryId' => $entry->getId(),
        ], 202);
    }

    // --- Split ---

    #[IsGranted('ROLE_PREMIUM')]
    #[Route('/convertisseur/split', name: 'app_convert_split', methods: ['POST'])]
    public function convertSplit(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $file      = $request->files->get('file');
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
            'Content-Type'        => 'application/zip',
            'Content-Disposition' => 'attachment; filename="split.zip"',
        ]);
    }

    // --- PDF/A ---

    #[IsGranted('ROLE_PREMIUM')]
    #[Route('/convertisseur/pdfa', name: 'app_convert_pdfa', methods: ['POST'])]
    public function convertPdfA(Request $request): Response
    {
        $this->denyAccessUnlessGranted(GenerationLimitVoter::CREATE, $this->getUser());

        $file     = $request->files->get('file');
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

        $file          = $request->files->get('file');
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
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }
}
