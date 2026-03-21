<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use App\Repository\PlanRepository;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class RegistrationController extends AbstractController
{
    public function __construct(private EmailVerifier $emailVerifier)
    {
    }

    #[Route('/register', name: 'app_register')]
    public function register(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager,
        PlanRepository $planRepository,
    ): Response {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var string $plainPassword */
            $plainPassword = $form->get('plainPassword')->getData();

            $user->setPassword($userPasswordHasher->hashPassword($user, $plainPassword));

            $entityManager->persist($user);
            $entityManager->flush();

            $this->sendVerificationEmail($user);

            return $this->redirectToRoute('app_verify_email_notice');
        }

        $formErrors = [];
        $formData = [];
        if ($form->isSubmitted()) {
            foreach ($form->getErrors(true) as $error) {
                $origin = $error->getOrigin();
                $fieldName = $origin ? $origin->getName() : 'global';
                $formErrors[$fieldName][] = $error->getMessage();
            }
            $formData = [
                'email'     => $form->get('email')->getData(),
                'firstname' => $form->get('firstname')->getData(),
                'lastname'  => $form->get('lastname')->getData(),
                'plan'      => $form->get('plan')->getData() ? $form->get('plan')->getData()->getId() : null,
            ];
        }

        $plans = array_map(
            fn($plan) => [
                'id' => $plan->getId(),
                'name' => $plan->getName(),
                'price' => $plan->getPrice(),
                'description' => $plan->getDescription(),
                'limit' => $plan->getLimitGeneration(),
            ],
            $planRepository->findBy(['active' => true])
        );

        return $this->render('registration/register.html.twig', [
            'plans'    => $plans,
            'errors'   => $formErrors,
            'formData' => $formData,
        ]);
    }

    /** Page affichée après inscription et pour les utilisateurs non vérifiés. */
    #[Route('/verify/notice', name: 'app_verify_email_notice')]
    public function verifyNotice(Request $request, EntityManagerInterface $em): Response
    {
        /** @var User|null $user */
        $user = $this->getUser();

        // Handle resend request
        if ($request->isMethod('POST') && $user) {
            $this->sendVerificationEmail($user);
            $this->addFlash('success', 'Un nouvel email de vérification vous a été envoyé.');
            return $this->redirectToRoute('app_verify_email_notice');
        }

        return $this->render('registration/verify_notice.html.twig');
    }

    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[Route('/verify/email', name: 'app_verify_email')]
    public function verifyUserEmail(Request $request, TranslatorInterface $translator): Response
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $exception) {
            $this->addFlash('verify_email_error', $translator->trans($exception->getReason(), [], 'VerifyEmailBundle'));
            return $this->redirectToRoute('app_verify_email_notice');
        }

        $this->addFlash('success', 'Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter.');

        return $this->redirectToRoute('app_login');
    }

    private function sendVerificationEmail(User $user): void
    {
        $this->emailVerifier->sendEmailConfirmation(
            'app_verify_email',
            $user,
            (new TemplatedEmail())
                ->from(new Address('noreply@zenpdf.fr', 'ZenPDF'))
                ->to((string) $user->getEmail())
                ->subject('Confirmez votre adresse email — ZenPDF')
                ->htmlTemplate('registration/confirmation_email.html.twig')
        );
    }
}
