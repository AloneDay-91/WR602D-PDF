<?php

namespace App\Command;

use App\Entity\Generation;
use App\Repository\QueueEntryRepository;
use App\Services\ApiGotenberg;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Part\DataPart;
use DateTimeImmutable;
use RuntimeException;

/**
 * @SuppressWarnings(PHPMD.CouplingBetweenObjects)
 */
#[AsCommand(
    name: 'app:handle-queue',
    description: 'Process pending PDF merge queue entries',
)]
class HandleQueueCommand extends Command
{
    public function __construct(
        private readonly QueueEntryRepository $queueRepo,
        private readonly ApiGotenberg $gotenberg,
        private readonly EntityManagerInterface $em,
        private readonly MailerInterface $mailer,
        private readonly string $projectDir,
        private readonly string $mailerFrom,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('limit', 'l', InputOption::VALUE_OPTIONAL, 'Number of entries to process', 10);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $limit   = (int) $input->getOption('limit');
        $entries = $this->queueRepo->findPending($limit);

        if (empty($entries)) {
            $output->writeln('No pending entries.');
            return Command::SUCCESS;
        }

        $output->writeln(sprintf('Processing %d entry(ies)…', count($entries)));

        foreach ($entries as $entry) {
            $entry->setStatus('processing');
            $this->em->flush();
            $this->processEntry($entry, $output);
            $this->em->flush();
        }

        $output->writeln('Done.');

        return Command::SUCCESS;
    }

    private function processEntry(mixed $entry, OutputInterface $output): void
    {
        try {
            $filesDir  = $entry->getFilesDir();
            $filePaths = glob($filesDir . '/*');

            if (empty($filePaths)) {
                throw new RuntimeException('No files found in queue directory.');
            }

            $filesData = [];
            foreach ($filePaths as $filePath) {
                $filesData[] = [
                    'content'  => file_get_contents($filePath),
                    'filename' => basename($filePath),
                    'mimeType' => 'application/pdf',
                ];
            }

            $pdfContent = $this->gotenberg->mergeFilesToPdf($filesData);

            $user           = $entry->getUser();
            $storedFilename = bin2hex(random_bytes(16)) . '.pdf';
            $dir            = $this->projectDir . '/var/pdf_storage/' . $user->getId();

            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            file_put_contents($dir . '/' . $storedFilename, $pdfContent);

            $generation = new Generation();
            $generation->setUser($user);
            $generation->setFile('merge');
            $generation->setCreateadAt(new DateTimeImmutable());
            $generation->setStoredFilename($storedFilename);
            $generation->setOriginalFilename('merged.pdf');
            $generation->setMimeType('application/pdf');
            $this->em->persist($generation);

            $email = (new TemplatedEmail())
                ->from(new Address($this->mailerFrom, 'ZenPDF'))
                ->to((string) $user->getEmail())
                ->subject('Votre fusion PDF est prête – ZenPDF')
                ->htmlTemplate('emails/merge_ready.html.twig')
                ->context(['user' => $user])
                ->attach($pdfContent, 'merged.pdf', 'application/pdf');

            $this->mailer->send($email);

            foreach ($filePaths as $f) {
                if (file_exists($f)) {
                    unlink($f);
                }
            }
            if (is_dir($filesDir)) {
                rmdir($filesDir);
            }

            $entry->setStatus('done');
            $entry->setProcessedAt(new DateTimeImmutable());

            $output->writeln(sprintf('  ✓ Entry #%d processed for user %s.', $entry->getId(), $user->getEmail()));
        } catch (\Throwable $e) {
            $entry->setStatus('failed');
            $entry->setErrorMessage(substr($e->getMessage(), 0, 1000));
            $output->writeln(sprintf('  ✗ Entry #%d failed: %s', $entry->getId(), $e->getMessage()));
        }
    }
}
