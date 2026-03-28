<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use DateTimeImmutable;

#[AsCommand(
    name: 'app:notify-expiring-subscriptions',
    description: 'Envoie un email aux utilisateurs dont l\'abonnement expire dans 1 ou 3 jours.',
)]
final class NotifyExpiringSubscriptionsCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly MailerInterface $mailer,
        private readonly EntityManagerInterface $em,
        private readonly string $mailerFrom,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io   = new SymfonyStyle($input, $output);
        $sent = 0;

        foreach ([1, 3] as $daysAhead) {
            $from = new DateTimeImmutable("today +{$daysAhead} days 00:00:00");
            $to   = new DateTimeImmutable("today +{$daysAhead} days 23:59:59");

            $users = $this->userRepository->createQueryBuilder('u')
                ->join('u.plan', 'p')
                ->where('u.subscriptionEndsAt BETWEEN :from AND :to')
                ->andWhere('p.price > 0')
                ->setParameter('from', $from)
                ->setParameter('to', $to)
                ->getQuery()
                ->getResult();

            foreach ($users as $user) {
                $email = (new TemplatedEmail())
                    ->from(new Address($this->mailerFrom, 'ZenPDF'))
                    ->to((string) $user->getEmail())
                    ->subject('Votre abonnement ZenPDF expire bientôt')
                    ->htmlTemplate('emails/subscription_expiry.html.twig')
                    ->context([
                        'user'      => $user,
                        'days_left' => $daysAhead,
                    ]);

                $this->mailer->send($email);
                $sent++;
            }
        }

        $io->success("$sent email(s) d'expiration envoyé(s).");

        return Command::SUCCESS;
    }
}
