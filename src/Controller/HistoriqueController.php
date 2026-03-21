<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserContact;
use App\Repository\GenerationRepository;
use App\Repository\QueueEntryRepository;
use App\Repository\ToolRepository;
use App\Repository\UserContactRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use DateTimeImmutable;
use ZipArchive;

/**
 * @SuppressWarnings(PHPMD.CouplingBetweenObjects)
 */
#[IsGranted('ROLE_USER')]
final class HistoriqueController extends AbstractController
{
    public function __construct(
        private readonly string $projectDir,
        private readonly EntityManagerInterface $em,
        private readonly MailerInterface $mailer,
    ) {
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

        $contacts = array_map(fn($c) => [
            'id'        => $c->getId(),
            'firstname' => $c->getFirstname(),
            'lastname'  => $c->getLastname(),
            'email'     => $c->getEmail(),
        ], $user->getUserContacts()->toArray());

        return $this->render('historique/index.html.twig', [
            'generations' => $generations,
            'tools'       => $tools,
            'contacts'    => $contacts,
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

    #[Route('/historique/download-zip', name: 'app_historique_download_zip', methods: ['POST'])]
    public function downloadZip(Request $request, GenerationRepository $generationRepository): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        $ids  = array_map('intval', $data['ids'] ?? []);

        if (empty($ids) || count($ids) > 30) {
            return new JsonResponse(['error' => 'Sélection invalide (1 à 30 fichiers).'], 400);
        }

        $files = $this->collectUserFiles($ids, $user, $generationRepository);

        if (empty($files)) {
            return new JsonResponse(['error' => 'Aucun fichier disponible.'], 404);
        }

        $tmp = $this->buildZipArchive($files);

        $date     = (new DateTimeImmutable())->format('Y-m-d');
        $response = new BinaryFileResponse($tmp);
        $response->headers->set('Content-Type', 'application/zip');
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, 'zenpdf_' . $date . '.zip');
        $response->deleteFileAfterSend(true);

        return $response;
    }

    private function collectUserFiles(array $ids, User $user, GenerationRepository $generationRepository): array
    {
        $files = [];
        foreach ($ids as $id) {
            $generation = $generationRepository->find($id);
            if (!$generation || $generation->getUser()?->getId() !== $user->getId()) {
                continue;
            }
            $storedFilename = $generation->getStoredFilename();
            if (!$storedFilename) {
                continue;
            }
            $path = $this->projectDir . '/var/pdf_storage/' . $user->getId() . '/' . $storedFilename;
            if (!file_exists($path)) {
                continue;
            }
            $files[] = [
                'path'     => $path,
                'filename' => $generation->getOriginalFilename() ?? $storedFilename,
            ];
        }
        return $files;
    }

    private function buildZipArchive(array $files): string
    {
        $zip = new ZipArchive();
        $tmp = tempnam(sys_get_temp_dir(), 'zenpdf_zip_');
        $zip->open($tmp, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        $names = [];
        foreach ($files as $file) {
            $name = $file['filename'];
            $base = pathinfo($name, PATHINFO_FILENAME);
            $ext  = pathinfo($name, PATHINFO_EXTENSION);
            $i    = 1;
            while (in_array($name, $names, true)) {
                $name = $base . '_' . $i++ . ($ext ? '.' . $ext : '');
            }
            $names[] = $name;
            $zip->addFile($file['path'], $name);
        }

        $zip->close();

        return $tmp;
    }

    #[Route('/api/queue/{id}/status', name: 'api_queue_status', methods: ['GET'])]
    public function queueStatus(int $id, QueueEntryRepository $queueRepo): JsonResponse
    {
        /** @var User $user */
        $user  = $this->getUser();
        $entry = $queueRepo->find($id);

        if (!$entry || $entry->getUser()?->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Introuvable.'], 404);
        }

        $map = [
            'pending'    => ['progress' => 20, 'message' => 'En attente dans la file…'],
            'processing' => ['progress' => 70, 'message' => 'Fusion en cours…'],
            'done'       => ['progress' => 100, 'message' => 'Terminé !'],
            'failed'     => ['progress' => 100, 'message' => $entry->getErrorMessage() ?? 'Une erreur est survenue.'],
        ];

        $status = $entry->getStatus();
        $info   = $map[$status] ?? ['progress' => 50, 'message' => 'En cours…'];

        return new JsonResponse([
            'status'   => $status,
            'progress' => $info['progress'],
            'message'  => $info['message'],
        ]);
    }

    // --- Contacts API ---

    #[Route('/api/contacts', name: 'api_contacts_list', methods: ['GET'])]
    public function listContacts(): JsonResponse
    {
        /** @var User $user */
        $user     = $this->getUser();
        $contacts = array_map(fn($c) => [
            'id'        => $c->getId(),
            'firstname' => $c->getFirstname(),
            'lastname'  => $c->getLastname(),
            'email'     => $c->getEmail(),
        ], $user->getUserContacts()->toArray());

        return new JsonResponse($contacts);
    }

    #[Route('/api/contacts', name: 'api_contacts_create', methods: ['POST'])]
    public function createContact(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Email invalide.'], 400);
        }

        $contact = new UserContact();
        $contact->setFirstname($data['firstname'] ?? '');
        $contact->setLastname($data['lastname'] ?? '');
        $contact->setEmail($data['email']);
        $contact->setUser($user);

        $this->em->persist($contact);
        $this->em->flush();

        return new JsonResponse([
            'id'        => $contact->getId(),
            'firstname' => $contact->getFirstname(),
            'lastname'  => $contact->getLastname(),
            'email'     => $contact->getEmail(),
        ], 201);
    }

    #[Route('/api/contacts/{id}', name: 'api_contacts_delete', methods: ['DELETE'])]
    public function deleteContact(int $id, UserContactRepository $contactRepo): JsonResponse
    {
        /** @var User $user */
        $user    = $this->getUser();
        $contact = $contactRepo->find($id);

        if (!$contact || $contact->getUser()?->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Contact introuvable.'], 404);
        }

        $this->em->remove($contact);
        $this->em->flush();

        return new JsonResponse(null, 204);
    }

    // --- Partage ---

    #[Route('/historique/{id}/share', name: 'app_historique_share', methods: ['POST'])]
    public function share(int $id, Request $request, GenerationRepository $generationRepo, UserContactRepository $contactRepo): JsonResponse
    {
        /** @var User $user */
        $user       = $this->getUser();
        $generation = $generationRepo->find($id);

        if (!$generation || $generation->getUser()?->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Document introuvable.'], 404);
        }

        $storedFilename = $generation->getStoredFilename();
        $filePath       = $this->projectDir . '/var/pdf_storage/' . $user->getId() . '/' . $storedFilename;

        if (!$storedFilename || !file_exists($filePath)) {
            return new JsonResponse(['error' => 'Fichier non disponible.'], 404);
        }

        $data       = json_decode($request->getContent(), true);
        $contactIds = $data['contacts'] ?? [];

        if (empty($contactIds)) {
            return new JsonResponse(['error' => 'Aucun contact sélectionné.'], 400);
        }

        $pdfContent = file_get_contents($filePath);
        $filename   = $generation->getOriginalFilename() ?? 'document.pdf';
        $senderName = trim(($user->getFirstname() ?? '') . ' ' . ($user->getLastname() ?? '')) ?: $user->getEmail();
        $mimeType   = $generation->getMimeType() ?? 'application/pdf';

        $sent = $this->dispatchShareEmails($contactIds, $user, $contactRepo, $generation, $senderName, $filename, $pdfContent, $mimeType);

        $this->em->flush();

        return new JsonResponse(['sent' => $sent]);
    }

    private function dispatchShareEmails(array $contactIds, User $user, UserContactRepository $contactRepo, mixed $generation, string $senderName, string $filename, string $pdfContent, string $mimeType): int
    {
        $sent = 0;
        foreach ($contactIds as $contactId) {
            $contact = $contactRepo->find((int) $contactId);
            if (!$contact || $contact->getUser()?->getId() !== $user->getId()) {
                continue;
            }
            $this->sendShareEmail($contact, $senderName, $filename, $pdfContent, $mimeType);
            $generation->addUserContact($contact);
            $sent++;
        }
        return $sent;
    }

    private function sendShareEmail(UserContact $contact, string $senderName, string $filename, string $pdfContent, string $mimeType): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address('noreply@zenpdf.fr', 'ZenPDF'))
            ->to($contact->getEmail())
            ->subject(sprintf('%s vous a partagé un document – ZenPDF', $senderName))
            ->htmlTemplate('emails/document_shared.html.twig')
            ->context([
                'contact_firstname' => $contact->getFirstname(),
                'contact_lastname'  => $contact->getLastname(),
                'sender_name'       => $senderName,
                'filename'          => $filename,
            ])
            ->attach($pdfContent, $filename, $mimeType);

        $this->mailer->send($email);
    }
}
