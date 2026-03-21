<?php

namespace App\Tests;

use App\Repository\PlanRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class RegistrationControllerTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $container    = static::getContainer();

        /** @var EntityManager $em */
        $em             = $container->get('doctrine')->getManager();
        $userRepository = $container->get(UserRepository::class);

        foreach ($userRepository->findAll() as $user) {
            $em->remove($user);
        }
        $em->flush();
    }

    public function testRegister(): void
    {
        $client    = $this->client;
        $container = static::getContainer();

        /** @var PlanRepository $planRepo */
        $planRepo = $container->get(PlanRepository::class);
        $freePlan = $planRepo->findOneBy(['role' => null]);

        // Page loads with correct French title
        $client->request('GET', '/register');
        self::assertResponseIsSuccessful();
        self::assertPageTitleContains('Inscription');

        // Extract CSRF token from the page's React props JSON
        $pageContent = $client->getResponse()->getContent();
        preg_match('/data-symfony--ux-react--react-props-value="([^"]+)"/', $pageContent, $propsMatch);
        $props = json_decode(html_entity_decode($propsMatch[1] ?? '{}'), true);
        $csrfToken = $props['csrfToken'] ?? '';

        // Submit form via direct POST (registration uses a React component)
        $client->request('POST', '/register', [
            'registration_form' => [
                'email'         => 'me@example.com',
                'firstname'     => 'Jean',
                'lastname'      => 'Dupont',
                'plan'          => $freePlan?->getId(),
                'plainPassword' => 'password123',
                'agreeTerms'    => '1',
                '_token'        => $csrfToken,
            ],
        ]);

        // After successful registration, redirects to verify notice
        self::assertResponseRedirects('/verify/notice');

        $userRepository = $container->get(UserRepository::class);
        self::assertCount(1, $userRepository->findAll());
        $user = $userRepository->findAll()[0];
        self::assertFalse($user->isVerified());

        // Verification email was sent
        self::assertEmailCount(1);
        $messages = $this->getMailerMessages();
        self::assertCount(2, $messages);
        self::assertEmailAddressContains($messages[0], 'from', 'noreply@zenpdf.fr');
        self::assertEmailAddressContains($messages[0], 'to', 'me@example.com');

        // Extract the verification link from HTML email body
        $client->loginUser($user);
        $messageBody = $messages[0]->getHtmlBody();
        self::assertIsString($messageBody);

        preg_match('#href="(http://localhost/verify/email[^"]+)"#', $messageBody, $match);
        self::assertNotEmpty($match, 'Verification link not found in email body');

        // Click the verification link
        $client->request('GET', $match[1]);
        $client->followRedirect();

        self::assertTrue($container->get(UserRepository::class)->findAll()[0]->isVerified());
    }
}
