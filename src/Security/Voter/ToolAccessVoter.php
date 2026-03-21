<?php

namespace App\Security\Voter;

use App\Entity\Tool;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ToolAccessVoter extends Voter
{
    public const ACCESS = 'TOOL_ACCESS';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::ACCESS && $subject instanceof Tool;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Tool $tool */
        $tool = $subject;

        // User roles: FREE → ['ROLE_USER'], BASIC → ['ROLE_USER','ROLE_BASIC'], PREMIUM → ['ROLE_USER','ROLE_PREMIUM']
        $userRoles = $token->getRoleNames();

        foreach ($tool->getPlans() as $plan) {
            // FREE plan has role = null → maps to ROLE_USER
            $requiredRole = $plan->getRole() ?? 'ROLE_USER';
            if (in_array($requiredRole, $userRoles, true)) {
                return true;
            }
        }

        return false;
    }
}
