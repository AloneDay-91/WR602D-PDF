<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260317100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add queue_entry table for async merge processing';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE queue_entry (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            files_dir VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT \'pending\',
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            processed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            error_message VARCHAR(1000) DEFAULT NULL,
            INDEX IDX_QUEUE_ENTRY_USER (user_id),
            INDEX IDX_QUEUE_ENTRY_STATUS (status),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE queue_entry ADD CONSTRAINT FK_QUEUE_ENTRY_USER FOREIGN KEY (user_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE queue_entry DROP FOREIGN KEY FK_QUEUE_ENTRY_USER');
        $this->addSql('DROP TABLE queue_entry');
    }
}