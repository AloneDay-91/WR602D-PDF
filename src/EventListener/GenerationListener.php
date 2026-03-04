<?php

namespace App\EventListener;

use App\Entity\Generation;
use App\Event\PdfGeneratedEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
#[AsEventListener(event: PdfGeneratedEvent::class)]
final class GenerationListener
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly string $projectDir,
    ) {
    }

    public function __invoke(PdfGeneratedEvent $event): void
    {
        $user = $event->getUser();
        $mime = $event->getMimeType();
        $ext  = $mime === 'application/zip' ? 'zip' : 'pdf';

        $storedFilename = bin2hex(random_bytes(16)) . '.' . $ext;
        $userId         = $user->getId();
        $dir            = $this->projectDir . '/var/pdf_storage/' . $userId;

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        file_put_contents($dir . '/' . $storedFilename, $event->getPdfContent());

        $generation = new Generation();
        $generation->setUser($user);
        $generation->setFile($event->getToolSlug());
        $generation->setCreateadAt(new \DateTimeImmutable());
        $generation->setStoredFilename($storedFilename);
        $generation->setOriginalFilename($event->getOriginalFilename());
        $generation->setMimeType($mime);

        $this->em->persist($generation);
        $this->em->flush();
    }
}
