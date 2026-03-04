<?php

namespace App\Event;

use App\Entity\User;

final class PdfGeneratedEvent
{
    public function __construct(
        private readonly User   $user,
        private readonly string $toolSlug,
        private readonly string $pdfContent,
        private readonly string $originalFilename,
        private readonly string $mimeType,
    ) {
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getToolSlug(): string
    {
        return $this->toolSlug;
    }

    public function getPdfContent(): string
    {
        return $this->pdfContent;
    }

    public function getOriginalFilename(): string
    {
        return $this->originalFilename;
    }

    public function getMimeType(): string
    {
        return $this->mimeType;
    }
}
