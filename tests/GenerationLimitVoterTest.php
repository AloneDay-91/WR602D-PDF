<?php

namespace App\Tests;

use App\Entity\Plan;
use App\Entity\User;
use App\Repository\GenerationRepository;
use App\Security\Voter\GenerationLimitVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class GenerationLimitVoterTest extends TestCase
{
    private function makeUser(int $limitGeneration): User
    {
        $plan = new Plan();
        $plan->setLimitGeneration($limitGeneration);

        $user = new User();
        $user->setPlan($plan);
        $user->setEmail('test@example.com');
        $user->setFirstname('Test');
        $user->setLastname('User');
        $user->setPassword('hashed');

        return $user;
    }

    private function makeVoter(int $countToday): GenerationLimitVoter
    {
        $repo = $this->createStub(GenerationRepository::class);
        $repo->method('countByUserToday')->willReturn($countToday);

        $dispatcher = $this->createMock(EventDispatcherInterface::class);

        return new GenerationLimitVoter($repo, $dispatcher);
    }

    public function testUnlimitedPlanAlwaysGranted(): void
    {
        $user  = $this->makeUser(0); // 0 = unlimited
        $voter = $this->makeVoter(100);
        $token = new UsernamePasswordToken($user, 'main', $user->getRoles());

        $result = $voter->vote($token, $user, [GenerationLimitVoter::CREATE]);

        $this->assertSame(1, $result); // ACCESS_GRANTED = 1
    }

    public function testNegativeLimitIsUnlimited(): void
    {
        $user  = $this->makeUser(-1); // -1 = unlimited
        $voter = $this->makeVoter(999);
        $token = new UsernamePasswordToken($user, 'main', $user->getRoles());

        $result = $voter->vote($token, $user, [GenerationLimitVoter::CREATE]);

        $this->assertSame(1, $result);
    }

    public function testBelowLimitIsGranted(): void
    {
        $user  = $this->makeUser(5);
        $voter = $this->makeVoter(3); // 3 out of 5 used
        $token = new UsernamePasswordToken($user, 'main', $user->getRoles());

        $result = $voter->vote($token, $user, [GenerationLimitVoter::CREATE]);

        $this->assertSame(1, $result);
    }

    public function testAtLimitIsDenied(): void
    {
        $user  = $this->makeUser(5);
        $voter = $this->makeVoter(5); // 5 out of 5 used
        $token = new UsernamePasswordToken($user, 'main', $user->getRoles());

        $result = $voter->vote($token, $user, [GenerationLimitVoter::CREATE]);

        $this->assertSame(-1, $result); // ACCESS_DENIED = -1
    }

    public function testAboveLimitIsDenied(): void
    {
        $user  = $this->makeUser(3);
        $voter = $this->makeVoter(10); // exceeded
        $token = new UsernamePasswordToken($user, 'main', $user->getRoles());

        $result = $voter->vote($token, $user, [GenerationLimitVoter::CREATE]);

        $this->assertSame(-1, $result);
    }

    public function testWrongAttributeIsAbstained(): void
    {
        $user  = $this->makeUser(5);
        $voter = $this->makeVoter(0);
        $token = new UsernamePasswordToken($user, 'main', $user->getRoles());

        $result = $voter->vote($token, $user, ['WRONG_ATTRIBUTE']);

        $this->assertSame(0, $result); // ACCESS_ABSTAIN = 0
    }
}