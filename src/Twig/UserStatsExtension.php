<?php

namespace App\Twig;

use App\Entity\User;
use App\Repository\GenerationRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class UserStatsExtension extends AbstractExtension
{
    public function __construct(
        private GenerationRepository $generationRepository,
        private Security $security,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('user_generations_today', $this->getGenerationsToday(...)),
        ];
    }

    public function getGenerationsToday(): int
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return 0;
        }

        return $this->generationRepository->countByUserToday($user);
    }
}
