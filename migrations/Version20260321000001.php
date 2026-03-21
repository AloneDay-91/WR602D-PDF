<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260321000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add last_limit_email_at and subscription_ends_at to user table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` ADD last_limit_email_at DATE DEFAULT NULL, ADD subscription_ends_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` DROP last_limit_email_at, DROP subscription_ends_at');
    }
}