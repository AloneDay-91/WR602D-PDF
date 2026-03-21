<?php

use App\DataFixtures\AppFixtures;
use Doctrine\Common\DataFixtures\Executor\ORMExecutor;
use Doctrine\Common\DataFixtures\Loader;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}

// Recreate the test database schema and load fixtures
$kernel = new \App\Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();

/** @var \Doctrine\ORM\EntityManagerInterface $em */
$em = $kernel->getContainer()->get('doctrine')->getManager();

$schemaTool = new SchemaTool($em);
$metadata   = $em->getMetadataFactory()->getAllMetadata();
$schemaTool->dropSchema($metadata);
$schemaTool->createSchema($metadata);

$loader = new Loader();
$loader->addFixture(new AppFixtures());
$executor = new ORMExecutor($em, new ORMPurger($em));
$executor->execute($loader->getFixtures());

$kernel->shutdown();