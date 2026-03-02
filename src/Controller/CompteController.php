<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\ToolRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/compte')]
final class CompteController extends AbstractController
{
    #[Route('', name: 'app_compte')]
    public function index(ToolRepository $toolRepository): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        /** @var User $user */
        $user = $this->getUser();

        $toolsData = array_map(fn($t) => [
            'id'          => $t->getId(),
            'name'        => $t->getName(),
            'icon'        => $t->getIcon(),
            'description' => $t->getDescription(),
            'slug'        => $t->getSlug(),
        ], $toolRepository->findBy(['isActive' => true]));

        $plan = $user->getPlan();

        return $this->render('compte/index.html.twig', [
            'tools'    => $toolsData,
            'userData' => [
                'firstname'     => $user->getFirstname(),
                'lastname'      => $user->getLastname(),
                'email'         => $user->getEmail(),
                'phone'         => $user->getPhone(),
                'dob'           => $user->getDob()?->format('Y-m-d'),
                'favoriteColor' => $user->getFavoriteColor(),
                'plan'          => $plan ? [
                    'name'            => $plan->getName(),
                    'limitGeneration' => $plan->getLimitGeneration(),
                    'price'           => $plan->getPrice(),
                    'description'     => $plan->getDescription(),
                ] : null,
            ],
        ]);
    }

    #[Route('/profile', name: 'app_compte_profile', methods: ['POST'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepository,
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_USER');

        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $errors = [];

        if (empty($data['firstname'])) {
            $errors['firstname'] = 'Le prénom est requis.';
        }
        if (empty($data['lastname'])) {
            $errors['lastname'] = 'Le nom est requis.';
        }
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Adresse email invalide.';
        } elseif ($data['email'] !== $user->getEmail()) {
            $existing = $userRepository->findOneBy(['email' => $data['email']]);
            if ($existing && $existing->getId() !== $user->getId()) {
                $errors['email'] = 'Cet email est déjà utilisé par un autre compte.';
            }
        }

        if ($errors) {
            return $this->json(['errors' => $errors], 422);
        }

        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);
        $user->setEmail($data['email']);
        $user->setPhone($data['phone'] ?: null);
        $user->setFavoriteColor($data['favoriteColor'] ?: null);

        if (!empty($data['dob'])) {
            try {
                $user->setDob(new \DateTime($data['dob']));
            } catch (\Exception) {
                $user->setDob(null);
            }
        } else {
            $user->setDob(null);
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

    #[Route('/password', name: 'app_compte_password', methods: ['POST'])]
    public function updatePassword(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_USER');

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