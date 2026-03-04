<?php

namespace App\Security\Voter;

use App\Entity\Plan;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class PlanSelectVoter extends Voter
{
    public const SELECT = 'PLAN_SELECT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::SELECT && $subject instanceof Plan;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Plan $plan */
        $plan = $subject;

        // Le plan doit être actif
        if (!$plan->isActive()) {
            return false;
        }

        // Un utilisateur ne peut pas sélectionner le plan qu'il a déjà
        if ($user->getPlan()?->getId() === $plan->getId()) {
            return false;
        }

        return true;
    }
}