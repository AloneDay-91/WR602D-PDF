<?php

namespace App\Services;

use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @SuppressWarnings(PHPMD.TooManyPublicMethods)
 */
readonly class ApiGotenberg
{
    public function __construct(
        private HttpClientInterface $client,
        private string $gotenbergUrl,
    ) {
    }

    public function convertUrlToPdf(string $url): string
    {
        $formData = new FormDataPart([
            'url' => $url,
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/chromium/convert/url', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function convertHtmlToPdf(string $htmlContent): string
    {
        $formData = new FormDataPart([
            'files' => new DataPart($htmlContent, 'index.html', 'text/html'),
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/chromium/convert/html', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function convertLibreOfficeToPdf(string $fileContent, string $filename, string $mimeType): string
    {
        $formData = new FormDataPart([
            'files' => new DataPart($fileContent, $filename, $mimeType),
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/libreoffice/convert', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    /**
     * @param array<array{content: string, filename: string, mimeType: string}> $files
     */
    public function mergeFilesToPdf(array $files): string
    {
        $parts = array_map(
            fn($f) => new DataPart($f['content'], $f['filename'], $f['mimeType']),
            $files
        );

        $formData = new FormDataPart([
            'files' => $parts,
            'merge'  => 'true',
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/libreoffice/convert', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function splitPdf(string $fileContent, string $filename, string $splitMode, string $splitSpan): string
    {
        $formData = new FormDataPart([
            'files'     => new DataPart($fileContent, $filename, 'application/pdf'),
            'splitMode' => $splitMode,
            'splitSpan' => $splitSpan,
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/libreoffice/convert', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function convertToPdfA(string $fileContent, string $filename, string $mimeType, string $standard): string
    {
        $formData = new FormDataPart([
            'files' => new DataPart($fileContent, $filename, $mimeType),
            'pdfa'  => $standard,
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/libreoffice/convert', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function encryptPdf(string $fileContent, string $filename, string $mimeType, ?string $userPassword, ?string $ownerPassword): string
    {
        $fields = [
            'files' => new DataPart($fileContent, $filename, $mimeType),
        ];

        if ($userPassword) {
            $fields['userPassword'] = $userPassword;
        }
        if ($ownerPassword) {
            $fields['ownerPassword'] = $ownerPassword;
        }

        $formData = new FormDataPart($fields);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/libreoffice/convert', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function convertMarkdownToPdf(string $markdownContent, string $filename): string
    {
        $mdFilename = pathinfo($filename, PATHINFO_FILENAME) . '.md';

        $indexHtml = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }
  code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
  pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
  h1, h2, h3 { margin-top: 1.5rem; }
  hr { border: none; border-top: 1px solid #ddd; }
</style>
</head>
<body>{{ toHTML "{$mdFilename}" }}</body>
</html>
HTML;

        $formData = new FormDataPart([
            'files' => [
                new DataPart($indexHtml, 'index.html', 'text/html'),
                new DataPart($markdownContent, $mdFilename, 'text/markdown'),
            ],
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/chromium/convert/markdown', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function screenshotUrl(string $url): string
    {
        $formData = new FormDataPart([
            'url' => $url,
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/chromium/screenshot/url', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }

    public function convertWysiwygToPdf(string $htmlContent): string
    {
        $fullHtml = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }
</style>
</head>
<body>{$htmlContent}</body>
</html>
HTML;

        $formData = new FormDataPart([
            'files' => new DataPart($fullHtml, 'index.html', 'text/html'),
        ]);

        $response = $this->client->request('POST', $this->gotenbergUrl . '/forms/chromium/convert/html', [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ]);

        return $response->getContent();
    }
}
