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
        //--- PLANS
        $planFree = new Plan();
        $planFree->setName('FREE');
        $planFree->setDescription('Abonnement gratuit');
        $planFree->setPrice(0);
        $planFree->setLimitGeneration(2);
        $planFree->setRole(null);
        $planFree->setActive(true);
        $planFree->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planFree);

        $planBasic = new Plan();
        $planBasic->setName('BASIC');
        $planBasic->setDescription('Abonnement basic - 20 générations par mois');
        $planBasic->setPrice(9.9);
        $planBasic->setLimitGeneration(20);
        $planBasic->setRole('ROLE_BASIC');
        $planBasic->setActive(true);
        $planBasic->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planBasic);

        $planPremium = new Plan();
        $planPremium->setName('PREMIUM');
        $planPremium->setDescription('Abonnement PREMIUM - générations illimitées');
        $planPremium->setPrice(45);
        $planPremium->setLimitGeneration(-1);
        $planPremium->setRole('ROLE_PREMIUM');
        $planPremium->setActive(true);
        $planPremium->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planPremium);

        //--- TOOLS ACCESSIBLES DEPUIS LE PLAN FREE+
        $tool = new Tool();
        $tool->setName('URL vers PDF');
        $tool->setDescription('Convertissez n\'importe quelle page web en PDF depuis son URL');
        $tool->setColor('blue');
        $tool->setIcon('Link');
        $tool->setSlug('url');
        $tool->setIsActive(true);
        $tool->addPlan($planFree);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        //--- TOOLS ACCESSIBLES DEPUIS LE PLAN BASIC+
        $tool = new Tool();
        $tool->setName('HTML vers PDF');
        $tool->setDescription('Convertissez un fichier HTML en PDF fidèle au rendu navigateur');
        $tool->setColor('orange');
        $tool->setIcon('Code');
        $tool->setSlug('html');
        $tool->setIsActive(true);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $tool = new Tool();
        $tool->setName('Word vers PDF');
        $tool->setDescription('Convertissez vos fichiers Word (.doc, .docx) en PDF via LibreOffice');
        $tool->setColor('blue');
        $tool->setIcon('FileText');
        $tool->setSlug('word');
        $tool->setIsActive(true);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $tool = new Tool();
        $tool->setName('Excel vers PDF');
        $tool->setDescription('Convertissez vos fichiers Excel (.xls, .xlsx) en PDF via LibreOffice');
        $tool->setColor('green');
        $tool->setIcon('Sheet');
        $tool->setSlug('excel');
        $tool->setIsActive(true);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $tool = new Tool();
        $tool->setName('PowerPoint vers PDF');
        $tool->setDescription('Convertissez vos présentations (.ppt, .pptx) en PDF via LibreOffice');
        $tool->setColor('red');
        $tool->setIcon('Presentation');
        $tool->setSlug('powerpoint');
        $tool->setIsActive(true);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $tool = new Tool();
        $tool->setName('Image vers PDF');
        $tool->setDescription('Convertissez vos images (.jpg, .png, .tiff…) en PDF');
        $tool->setColor('purple');
        $tool->setIcon('Image');
        $tool->setSlug('image');
        $tool->setIsActive(true);
        $tool->addPlan($planBasic);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        //--- TOOLS ACCESSIBLES DEPUIS LE PLAN PREMIUM UNIQUEMENT
        $tool = new Tool();
        $tool->setName('Fusionner des PDFs');
        $tool->setDescription('Combinez plusieurs fichiers PDF en un seul document');
        $tool->setColor('indigo');
        $tool->setIcon('Combine');
        $tool->setSlug('merge');
        $tool->setIsActive(true);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $tool = new Tool();
        $tool->setName('Découper un PDF');
        $tool->setDescription('Extrayez des pages ou des intervalles d\'un PDF');
        $tool->setColor('yellow');
        $tool->setIcon('Scissors');
        $tool->setSlug('split');
        $tool->setIsActive(true);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $tool = new Tool();
        $tool->setName('Convertir en PDF/A');
        $tool->setDescription('Archivez vos documents en format PDF/A-1b, PDF/A-2b ou PDF/A-3b');
        $tool->setColor('teal');
        $tool->setIcon('Archive');
        $tool->setSlug('pdfa');
        $tool->setIsActive(true);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $tool = new Tool();
        $tool->setName('Protéger un PDF');
        $tool->setDescription('Chiffrez votre PDF avec un mot de passe utilisateur et/ou propriétaire');
        $tool->setColor('rose');
        $tool->setIcon('LockKeyhole');
        $tool->setSlug('encrypt');
        $tool->setIsActive(true);
        $tool->addPlan($planPremium);
        $manager->persist($tool);

        $manager->flush();

    }
}
