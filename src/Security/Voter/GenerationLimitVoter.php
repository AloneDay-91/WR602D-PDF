<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Repository\GenerationRepository;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class GenerationLimitVoter extends Voter
{
    public const CREATE = 'GENERATION_CREATE';

    public function __construct(private GenerationRepository $generationRepository)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::CREATE && $subject instanceof User;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var User $subject */
        $plan = $user->getPlan();
        if ($plan === null) {
            return false;
        }

        $limit = $plan->getLimitGeneration();

        // Limite de -1 ou 0 = illimitée
        if ($limit <= 0) {
            return true;
        }

        $count = $this->generationRepository->countByUser($user);

        return $count < $limit;
    }
}