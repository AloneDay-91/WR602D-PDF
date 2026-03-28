<?php

namespace App\Controller;

use App\Repository\ToolRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Attribute\Route;

final class ContactController extends AbstractController
{
    public function __construct(private readonly string $mailerFrom)
    {
    }

    #[Route('/contact', name: 'app_contact')]
    public function index(ToolRepository $toolRepository): Response
    {
        /** @var \App\Entity\User|null $user */
        $user = $this->getUser();

        $tools = array_map(function ($t) {
            $minPlan = null;
            foreach ($t->getPlans() as $plan) {
                if ($minPlan === null || $plan->getPrice() < $minPlan->getPrice()) {
                    $minPlan = $plan;
                }
            }
            return [
                'id'          => $t->getId(),
                'name'        => $t->getName(),
                'icon'        => $t->getIcon(),
                'description' => $t->getDescription(),
                'slug'        => $t->getSlug(),
                'minPlan'     => $minPlan ? ['name' => $minPlan->getName(), 'price' => $minPlan->getPrice()] : null,
            ];
        }, $toolRepository->findBy(['isActive' => true]));

        return $this->render('contact/index.html.twig', [
            'tools'   => $tools,
            'prefill' => $user ? [
                'name'  => $user->getFirstname() . ' ' . $user->getLastname(),
                'email' => $user->getEmail(),
            ] : null,
        ]);
    }

    #[Route('/contact/send', name: 'app_contact_send', methods: ['POST'])]
    public function send(Request $request, MailerInterface $mailer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $name    = trim($data['name'] ?? '');
        $email   = trim($data['email'] ?? '');
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');

        $errors = [];

        if (empty($name)) {
            $errors['name'] = 'Le nom est requis.';
        }
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Adresse email invalide.';
        }
        if (empty($subject)) {
            $errors['subject'] = 'Le sujet est requis.';
        }
        if (empty($message) || mb_strlen($message) < 10) {
            $errors['message'] = 'Le message doit contenir au moins 10 caractères.';
        }

        if ($errors) {
            return $this->json(['errors' => $errors], 422);
        }

        $mail = (new TemplatedEmail())
            ->from(new Address($this->mailerFrom, 'ZenPDF'))
            ->to('contact@zenpdf.fr')
            ->replyTo($email)
            ->subject("[Contact] $subject")
            ->htmlTemplate('emails/contact_notification.html.twig')
            ->context([
                'name'    => $name,
                'email'   => $email,
                'subject' => $subject,
                'message' => $message,
            ]);

        $mailer->send($mail);

        return $this->json(['success' => true, 'message' => 'Votre message a bien été envoyé.']);
    }
}
