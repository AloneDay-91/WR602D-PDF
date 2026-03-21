<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260317100001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add markdown, screenshot and wysiwyg tools';
    }

    public function up(Schema $schema): void
    {
        // Insert tools
        $this->addSql("INSERT INTO tool (name, icon, description, color, is_active, slug) VALUES ('Markdown vers PDF', 'FileText', 'Convertissez un fichier Markdown (.md) en PDF mis en forme', 'cyan', 1, 'markdown')");
        $this->addSql("INSERT INTO tool (name, icon, description, color, is_active, slug) VALUES ('Capture d\\'écran', 'Camera', 'Capturez n\\'importe quelle page web en image PNG haute qualité', 'pink', 1, 'screenshot')");
        $this->addSql("INSERT INTO tool (name, icon, description, color, is_active, slug) VALUES ('Éditeur WYSIWYG', 'PenLine', 'Rédigez votre document dans l\\'éditeur riche et exportez-le en PDF', 'violet', 1, 'wysiwyg')");

        // Link to BASIC and PREMIUM plans
        $this->addSql("INSERT INTO tool_plan (tool_id, plan_id) SELECT t.id, p.id FROM tool t JOIN plan p ON p.role IN ('ROLE_BASIC', 'ROLE_PREMIUM') WHERE t.slug IN ('markdown', 'screenshot', 'wysiwyg')");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("DELETE tp FROM tool_plan tp JOIN tool t ON t.id = tp.tool_id WHERE t.slug IN ('markdown', 'screenshot', 'wysiwyg')");
        $this->addSql("DELETE FROM tool WHERE slug IN ('markdown', 'screenshot', 'wysiwyg')");
    }
}