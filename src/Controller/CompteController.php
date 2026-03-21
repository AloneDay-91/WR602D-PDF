<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\GenerationRepository;
use App\Repository\PlanRepository;
use App\Repository\ToolRepository;
use App\Repository\UserRepository;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use DateTime;

#[Route('/compte')]
#[IsGranted('ROLE_USER')]
/**
 * @SuppressWarnings(PHPMD.CouplingBetweenObjects)
 */
final class CompteController extends AbstractController
{
    #[Route('', name: 'app_compte')]
    public function index(ToolRepository $toolRepository, GenerationRepository $generationRepository, StripeService $stripeService, PlanRepository $planRepository,): Response
    {

        /** @var User $user */
        $user = $this->getUser();


        $plans = $planRepository->findBy(['active' => true], ['price' => 'ASC']);
        $allTools = $toolRepository->findBy(['isActive' => true]);

        $toolsByPlanId = [];
        foreach ($allTools as $tool) {
            foreach ($tool->getPlans() as $plan) {
                $toolsByPlanId[$plan->getId()][] = [
                    'name' => $tool->getName(),
                    'slug' => $tool->getSlug(),
                    'icon' => $tool->getIcon(),
                ];
            }
        }

        $plansData = array_map(function ($plan) use ($toolsByPlanId) {
            return [
                'id' => $plan->getId(),
                'name' => $plan->getName(),
                'description' => $plan->getDescription(),
                'price' => $plan->getPrice(),
                'specialPrice' => $plan->getSpecialPrice(),
                'limitGeneration' => $plan->getLimitGeneration(),
                'tools' => $toolsByPlanId[$plan->getId()] ?? [],
            ];
        }, $plans);

        $toolsData = array_map(function ($t) {
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
        }, $allTools);

        $plan = $user->getPlan();
        $generationsToday = $generationRepository->countByUserToday($user);
        $invoices = $stripeService->getInvoices($user);

        return $this->render('compte/index.html.twig', [
            'tools'    => $toolsData,
            'userData' => [
                'firstname'         => $user->getFirstname(),
                'lastname'          => $user->getLastname(),
                'email'             => $user->getEmail(),
                'phone'             => $user->getPhone(),
                'dob'               => $user->getDob()?->format('Y-m-d'),
                'favoriteColor'     => $user->getFavoriteColor(),
                'generationsToday'  => $generationsToday,
                'isBasic'           => $this->isGranted('ROLE_BASIC'),
                'isPremium'         => $this->isGranted('ROLE_PREMIUM'),
                'plan'              => $plan ? [
                    'name'            => $plan->getName(),
                    'limitGeneration' => $plan->getLimitGeneration(),
                    'price'           => $plan->getPrice(),
                    'description'     => $plan->getDescription(),
                ] : null,
                'invoices'          => $invoices,
                'hasStripeCustomer' => (bool) $user->getStripeCustomerId(),
                'tools' => $toolsData,
            ],
        ]);
    }

    #[Route('/profile', name: 'app_compte_profile', methods: ['POST'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $errors = $this->validateProfileData($data, $user, $userRepository);
        if ($errors) {
            return $this->json(['errors' => $errors], 422);
        }

        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);
        $user->setEmail($data['email']);
        $user->setPhone($data['phone'] ?: null);
        $user->setFavoriteColor($data['favoriteColor'] ?: null);

        $user->setDob(null);
        if (!empty($data['dob'])) {
            try {
                $user->setDob(new DateTime($data['dob']));
            } catch (\Exception) {
                $user->setDob(null);
            }
        }

        $em->flush();

        return $this->json([
            'success'  => true,
            'message'  => 'Profil mis à jour avec succès.',
            'firstname' => $user->getFirstname(),
            'lastname'  => $user->getLastname(),
            'email'     => $user->getEmail(),
        ]);
    }

    private function validateProfileData(array $data, User $user, UserRepository $userRepository): array
    {
        $errors = [];

        if (empty($data['firstname'])) {
            $errors['firstname'] = 'Le prénom est requis.';
        }
        if (empty($data['lastname'])) {
            $errors['lastname'] = 'Le nom est requis.';
        }
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Adresse email invalide.';
            return $errors;
        }
        if ($data['email'] !== $user->getEmail()) {
            $existing = $userRepository->findOneBy(['email' => $data['email']]);
            if ($existing && $existing->getId() !== $user->getId()) {
                $errors['email'] = 'Cet email est déjà utilisé par un autre compte.';
            }
        }

        return $errors;
    }

    #[Route('/password', name: 'app_compte_password', methods: ['POST'])]
    public function updatePassword(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $errors = [];

        if (empty($data['currentPassword'])) {
            $errors['currentPassword'] = 'Le mot de passe actuel est requis.';
        } elseif (!$hasher->isPasswordValid($user, $data['currentPassword'])) {
            $errors['currentPassword'] = 'Mot de passe actuel incorrect.';
        }

        if (empty($data['newPassword']) || strlen($data['newPassword']) < 8) {
            $errors['newPassword'] = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
        }

        if (($data['newPassword'] ?? '') !== ($data['confirmPassword'] ?? '')) {
            $errors['confirmPassword'] = 'Les mots de passe ne correspondent pas.';
        }

        if ($errors) {
            return $this->json(['errors' => $errors], 422);
        }

        $user->setPassword($hasher->hashPassword($user, $data['newPassword']));
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Mot de passe mis à jour avec succès.']);
    }
}
