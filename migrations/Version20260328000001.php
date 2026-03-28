<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260328000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add stripe_price_id_yearly to plan table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE plan ADD stripe_price_id_yearly VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE plan DROP COLUMN stripe_price_id_yearly');
    }
}