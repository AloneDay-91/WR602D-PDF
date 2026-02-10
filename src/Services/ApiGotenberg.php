<?php

namespace App\Services;

use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;

readonly class ApiGotenberg
{
    public function __construct(
        private HttpClientInterface $client,
        private string              $gotenbergUrl,
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
}
