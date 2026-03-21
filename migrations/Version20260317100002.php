<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260317100002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ensure URL tool is linked to FREE plan';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("INSERT IGNORE INTO tool_plan (tool_id, plan_id)
            SELECT t.id, p.id FROM tool t CROSS JOIN plan p
            WHERE t.slug = 'url' AND p.name = 'FREE'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("DELETE tp FROM tool_plan tp
            JOIN tool t ON t.id = tp.tool_id
            JOIN plan p ON p.id = tp.plan_id
            WHERE t.slug = 'url' AND p.name = 'FREE'");
    }
}