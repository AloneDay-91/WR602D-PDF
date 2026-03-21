<?php

namespace App\DataFixtures;

use App\Entity\Plan;
use App\Entity\Tool;
use App\Repository\PlanRepository;
use App\Repository\ToolRepository;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $planRepo = $manager->getRepository(Plan::class);
        $toolRepo = $manager->getRepository(Tool::class);

        $planFree    = $this->createPlan($manager, $planRepo, 'FREE', 'Abonnement gratuit', 0, 2, null);
        $planBasic   = $this->createPlan($manager, $planRepo, 'BASIC', 'Abonnement basic - 20 générations par mois', 9.99, 20, 'ROLE_BASIC');
        $planPremium = $this->createPlan($manager, $planRepo, 'PREMIUM', 'Abonnement PREMIUM - générations illimitées', 45, -1, 'ROLE_PREMIUM');

        $this->createFreeTools($manager, $toolRepo, $planFree, $planBasic, $planPremium);
        $this->createBasicTools($manager, $toolRepo, $planBasic, $planPremium);
        $this->createPremiumTools($manager, $toolRepo, $planPremium);

        $manager->flush();
    }

    private function createPlan(ObjectManager $manager, object $repo, string $name, string $description, float $price, int $limit, ?string $role): Plan
    {
        $plan = $repo->findOneBy(['name' => $name]);
        if ($plan) {
            return $plan;
        }

        $plan = new Plan();
        $plan->setName($name);
        $plan->setDescription($description);
        $plan->setPrice($price);
        $plan->setLimitGeneration($limit);
        $plan->setRole($role);
        $plan->setActive(true);
        $plan->setCreatedAt(new DateTimeImmutable());
        $manager->persist($plan);

        return $plan;
    }

    private function createTool(ObjectManager $manager, object $repo, string $name, string $description, string $color, string $icon, string $slug, array $plans): void
    {
        $tool = $repo->findOneBy(['slug' => $slug]);
        if (!$tool) {
            $tool = new Tool();
            $tool->setName($name);
            $tool->setDescription($description);
            $tool->setColor($color);
            $tool->setIcon($icon);
            $tool->setSlug($slug);
            $tool->setIsActive(true);
            $manager->persist($tool);
        }

        // Sync plans (add missing ones)
        foreach ($plans as $plan) {
            if (!$tool->getPlans()->contains($plan)) {
                $tool->addPlan($plan);
            }
        }
    }

    private function createFreeTools(ObjectManager $manager, object $repo, Plan $free, Plan $basic, Plan $premium): void
    {
        $this->createTool($manager, $repo, 'URL vers PDF', 'Convertissez n\'importe quelle page web en PDF depuis son URL', 'blue', 'Link', 'url', [$free, $basic, $premium]);
    }

    private function createBasicTools(ObjectManager $manager, object $repo, Plan $basic, Plan $premium): void
    {
        $this->createTool($manager, $repo, 'HTML vers PDF', 'Convertissez un fichier HTML en PDF fidèle au rendu navigateur', 'orange', 'Code', 'html', [$basic, $premium]);
        $this->createTool($manager, $repo, 'Word vers PDF', 'Convertissez vos fichiers Word (.doc, .docx) en PDF via LibreOffice', 'blue', 'FileText', 'word', [$basic, $premium]);
        $this->createTool($manager, $repo, 'Excel vers PDF', 'Convertissez vos fichiers Excel (.xls, .xlsx) en PDF via LibreOffice', 'green', 'Sheet', 'excel', [$basic, $premium]);
        $this->createTool($manager, $repo, 'PowerPoint vers PDF', 'Convertissez vos présentations (.ppt, .pptx) en PDF via LibreOffice', 'red', 'Presentation', 'powerpoint', [$basic, $premium]);
        $this->createTool($manager, $repo, 'Image vers PDF', 'Convertissez vos images (.jpg, .png, .tiff…) en PDF', 'purple', 'Image', 'image', [$basic, $premium]);
        $this->createTool($manager, $repo, 'Markdown vers PDF', 'Convertissez un fichier Markdown (.md) en PDF mis en forme', 'cyan', 'FileText', 'markdown', [$basic, $premium]);
        $this->createTool($manager, $repo, 'Capture d\'écran', 'Capturez n\'importe quelle page web en image PNG haute qualité', 'pink', 'Camera', 'screenshot', [$basic, $premium]);
        $this->createTool($manager, $repo, 'Éditeur WYSIWYG', 'Rédigez votre document dans l\'éditeur riche et exportez-le en PDF', 'violet', 'PenLine', 'wysiwyg', [$basic, $premium]);
    }

    private function createPremiumTools(ObjectManager $manager, object $repo, Plan $premium): void
    {
        $this->createTool($manager, $repo, 'Fusionner des PDFs', 'Combinez plusieurs fichiers PDF en un seul document', 'indigo', 'Combine', 'merge', [$premium]);
        $this->createTool($manager, $repo, 'Découper un PDF', 'Extrayez des pages ou des intervalles d\'un PDF', 'yellow', 'Scissors', 'split', [$premium]);
        $this->createTool($manager, $repo, 'Convertir en PDF/A', 'Archivez vos documents en format PDF/A-1b, PDF/A-2b ou PDF/A-3b', 'teal', 'Archive', 'pdfa', [$premium]);
        $this->createTool($manager, $repo, 'Protéger un PDF', 'Chiffrez votre PDF avec un mot de passe utilisateur et/ou propriétaire', 'rose', 'LockKeyhole', 'encrypt', [$premium]);
    }
}