<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Event\LimitReachedEvent;
use App\Repository\GenerationRepository;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class GenerationLimitVoter extends Voter
{
    public const CREATE = 'GENERATION_CREATE';

    public function __construct(
        private readonly GenerationRepository $generationRepository,
        private readonly EventDispatcherInterface $eventDispatcher,
    ) {
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

        // -1 or 0 = unlimited
        if ($limit <= 0) {
            return true;
        }

        $count = $this->generationRepository->countByUserToday($user);

        if ($count >= $limit) {
            $this->eventDispatcher->dispatch(new LimitReachedEvent($user));
            return false;
        }

        return true;
    }
}
