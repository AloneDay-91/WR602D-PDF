<?php

namespace App\EventListener;

use App\Event\LimitReachedEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use DateTime;

#[AsEventListener(event: LimitReachedEvent::class)]
final class LimitReachedListener
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly EntityManagerInterface $em,
    ) {
    }

    public function __invoke(LimitReachedEvent $event): void
    {
        $user = $event->user;
        $today = new DateTime('today');

        // Send at most one email per day
        $last = $user->getLastLimitEmailAt();
        if ($last !== null && $last >= $today) {
            return;
        }

        $email = (new TemplatedEmail())
            ->from(new Address('noreply@zenpdf.fr', 'ZenPDF'))
            ->to((string) $user->getEmail())
            ->subject('Limite de conversions atteinte — ZenPDF')
            ->htmlTemplate('emails/limit_reached.html.twig')
            ->context([
                'user'  => $user,
                'limit' => $user->getPlan()?->getLimitGeneration(),
            ]);

        $this->mailer->send($email);

        $user->setLastLimitEmailAt(new DateTime());
        $this->em->flush();
    }
}
