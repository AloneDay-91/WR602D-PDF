<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use App\Entity\Plan;
use App\Entity\Tool;

use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        //--- CREATION PLAN GRATUIT
        $planFree = new Plan();
        $planFree->setName('FREE');
        $planFree->setDescription('Abonnement gratuit');
        $planFree->setPrice(0);
        $planFree->setLimitGeneration(2);
        $planFree->setActive(true);
        //--- DONE - A REMPLACER PAR UN LIFECYCLE
        $planFree->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planFree);

        //--- CREATION PLAN BASIC
        $planBasic = new Plan();
        $planBasic->setName('BASIC');
        $planBasic->setDescription('Abonnement basic - 20 générations par jour');
        $planBasic->setPrice(9.9);
        $planBasic->setLimitGeneration(20);
        $planBasic->setActive(true);
        $planBasic->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planBasic);

        //--- CREATION PLAN PREMIUM
        $planPremium = new Plan();
        $planPremium->setName('PREMIUM');
        $planPremium->setDescription('Abonnement PREMIUM - 200 générations par jour');
        $planPremium->setPrice(45);
        $planPremium->setLimitGeneration(200);
        $planPremium->setActive(true);
        $planPremium->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planPremium);


        //--- CREATION D'UN TOOL
        $tool = new Tool();
        $tool->setName('URL vers PDF');
        $tool->setDescription('Convertissez une URL vers PDF');
        $tool->setColor('blue');
        $tool->setIcon('fa-solid fa-link');
        $tool->setIsActive(true);
        $tool->addPlan($planFree);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);

        $manager->persist($tool);

        //--- CREATION D'UN TOOL
        $tool = new Tool();
        $tool->setName('HTML vers PDF');
        $tool->setDescription('Convertissez un fichier HTML vers PDF');
        $tool->setColor('pink');
        $tool->setIcon('fa-solid fa-html5');
        $tool->setIsActive(true);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);

        $manager->persist($tool);


        $manager->flush();

    }
}
