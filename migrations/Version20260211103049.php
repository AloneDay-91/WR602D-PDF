<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260211103049 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE tool (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, icon VARCHAR(255) DEFAULT NULL, description LONGTEXT DEFAULT NULL, color VARCHAR(255) DEFAULT NULL, is_active TINYINT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE tool_plan (tool_id INT NOT NULL, plan_id INT NOT NULL, INDEX IDX_6181B368F7B22CC (tool_id), INDEX IDX_6181B36E899029B (plan_id), PRIMARY KEY (tool_id, plan_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE tool_plan ADD CONSTRAINT FK_6181B368F7B22CC FOREIGN KEY (tool_id) REFERENCES tool (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE tool_plan ADD CONSTRAINT FK_6181B36E899029B FOREIGN KEY (plan_id) REFERENCES plan (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE tool_plan DROP FOREIGN KEY FK_6181B368F7B22CC');
        $this->addSql('ALTER TABLE tool_plan DROP FOREIGN KEY FK_6181B36E899029B');
        $this->addSql('DROP TABLE tool');
        $this->addSql('DROP TABLE tool_plan');
    }
}
