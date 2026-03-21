<?php

namespace App\Tests;

use App\Entity\Plan;
use App\Entity\User;
use App\Repository\PlanRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ConvertisseurControllerTest extends WebTestCase
{
    private function createUserWithPlan(EntityManagerInterface $em, PlanRepository $planRepo, string $role): User
    {
        // 'ROLE_USER' is not a plan role; fall back to the FREE plan (role = null)
        $plan = $planRepo->findOneBy(['role' => $role])
            ?? $planRepo->findOneBy(['role' => null]);

        $user = new User();
        $user->setEmail(uniqid('test_') . '@example.com');
        $user->setFirstname('Test');
        $user->setLastname('User');
        $user->setPassword(password_hash('password', PASSWORD_BCRYPT));
        $user->setIsVerified(true);

        if ($plan) {
            $user->setPlan($plan);
        }

        $em->persist($user);
        $em->flush();

        return $user;
    }

    public function testConvertisseurRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/convertisseur/url');

        $this->assertResponseRedirects('/login');
    }

    public function testConvertisseurUrlAccessibleByRoleUser(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();

        /** @var EntityManagerInterface $em */
        $em = $container->get('doctrine')->getManager();

        /** @var PlanRepository $planRepo */
        $planRepo = $container->get(PlanRepository::class);

        $user = $this->createUserWithPlan($em, $planRepo, 'ROLE_USER');
        $client->loginUser($user);

        $client->request('GET', '/convertisseur/url');
        $this->assertResponseIsSuccessful();

        $em->remove($user);
        $em->flush();
    }

    public function testConvertisseurHtmlRequiresRoleBasic(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();

        /** @var EntityManagerInterface $em */
        $em = $container->get('doctrine')->getManager();

        /** @var PlanRepository $planRepo */
        $planRepo = $container->get(PlanRepository::class);

        $user = $this->createUserWithPlan($em, $planRepo, 'ROLE_USER');
        $client->loginUser($user);

        $client->request('GET', '/convertisseur/html');
        // Should be 403 or redirect if user doesn't have ROLE_BASIC
        $statusCode = $client->getResponse()->getStatusCode();
        $this->assertContains($statusCode, [403, 302]);

        $em->remove($user);
        $em->flush();
    }

    public function testHistoriqueRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/historique');

        $this->assertResponseRedirects('/login');
    }

    public function testHistoriqueAccessibleWhenLoggedIn(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();

        /** @var EntityManagerInterface $em */
        $em = $container->get('doctrine')->getManager();

        /** @var PlanRepository $planRepo */
        $planRepo = $container->get(PlanRepository::class);

        $user = $this->createUserWithPlan($em, $planRepo, 'ROLE_USER');
        $client->loginUser($user);

        $client->request('GET', '/historique');
        $this->assertResponseIsSuccessful();

        $em->remove($user);
        $em->flush();
    }

    public function testApiContactsRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/contacts');

        $this->assertResponseRedirects('/login');
    }

    public function testApiContactsListReturnsJson(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();

        /** @var EntityManagerInterface $em */
        $em = $container->get('doctrine')->getManager();

        /** @var PlanRepository $planRepo */
        $planRepo = $container->get(PlanRepository::class);

        $user = $this->createUserWithPlan($em, $planRepo, 'ROLE_USER');
        $client->loginUser($user);

        $client->request('GET', '/api/contacts');
        $this->assertResponseIsSuccessful();
        $this->assertJson($client->getResponse()->getContent());

        $em->remove($user);
        $em->flush();
    }

    public function testApiContactsCreate(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();

        /** @var EntityManagerInterface $em */
        $em = $container->get('doctrine')->getManager();

        /** @var PlanRepository $planRepo */
        $planRepo = $container->get(PlanRepository::class);

        $user = $this->createUserWithPlan($em, $planRepo, 'ROLE_USER');
        $client->loginUser($user);

        $client->request('POST', '/api/contacts', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'firstname' => 'Jean',
            'lastname'  => 'Dupont',
            'email'     => 'jean.dupont@example.com',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Jean', $data['firstname']);
        $this->assertSame('jean.dupont@example.com', $data['email']);

        $em->remove($user);
        $em->flush();
    }
}
