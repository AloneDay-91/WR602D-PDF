<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260203093602 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE generation DROP FOREIGN KEY `FK_D3266C3B9D86650F`');
        $this->addSql('DROP INDEX IDX_D3266C3B9D86650F ON generation');
        $this->addSql('ALTER TABLE generation CHANGE user_id_id user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE generation ADD CONSTRAINT FK_D3266C3BA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_D3266C3BA76ED395 ON generation (user_id)');
        $this->addSql('ALTER TABLE user_contact DROP FOREIGN KEY `FK_146FF8329D86650F`');
        $this->addSql('DROP INDEX IDX_146FF8329D86650F ON user_contact');
        $this->addSql('ALTER TABLE user_contact CHANGE user_id_id user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user_contact ADD CONSTRAINT FK_146FF832A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_146FF832A76ED395 ON user_contact (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE generation DROP FOREIGN KEY FK_D3266C3BA76ED395');
        $this->addSql('DROP INDEX IDX_D3266C3BA76ED395 ON generation');
        $this->addSql('ALTER TABLE generation CHANGE user_id user_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE generation ADD CONSTRAINT `FK_D3266C3B9D86650F` FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_D3266C3B9D86650F ON generation (user_id_id)');
        $this->addSql('ALTER TABLE user_contact DROP FOREIGN KEY FK_146FF832A76ED395');
        $this->addSql('DROP INDEX IDX_146FF832A76ED395 ON user_contact');
        $this->addSql('ALTER TABLE user_contact CHANGE user_id user_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user_contact ADD CONSTRAINT `FK_146FF8329D86650F` FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_146FF8329D86650F ON user_contact (user_id_id)');
    }
}
