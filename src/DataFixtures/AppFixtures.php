<?php

namespace App\DataFixtures;

use App\Entity\Plan;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $plan = new Plan();
        $plan->setName("FREE");
        $plan->setDescription("Abonnement gratuit");
        $plan->setPrice(0);
        $plan->setLimitGeneration(2);
        $plan->setActive(true);
        // TODO - A remplacer par un LIFECYCLE
        $plan->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($plan);


        $plan = new Plan();
        $plan->setName("BASIC");
        $plan->setDescription("Abonnement basic");
        $plan->setPrice(9.99);
        $plan->setLimitGeneration(20);
        $plan->setActive(true);
        // TODO - A remplacer par un LIFECYCLE
        $plan->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($plan);

        $plan = new Plan();
        $plan->setName("PRO");
        $plan->setDescription("Abonnement pro");
        $plan->setPrice(19.99);
        $plan->setLimitGeneration(100);
        $plan->setActive(true);
        // TODO - A remplacer par un LIFECYCLE
        $plan->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($plan);

        $manager->flush();
    }
}
