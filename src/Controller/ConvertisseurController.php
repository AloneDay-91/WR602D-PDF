<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Services\ApiGotenberg;
use App\Form\ConvertisseurType;

final class ConvertisseurController extends AbstractController
{
    private ApiGotenberg $pdfService;

    public function __construct(ApiGotenberg $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    #[Route('/convertisseur', name: 'app_convertisseur', methods: ['GET', 'POST'])]
    public function index(Request $request): Response
    {
        $form = $this->createForm(ConvertisseurType::class);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $url = $form->getData()['url'];
            $htmlFile = $form->getData()['htmlFile'];

            if ($htmlFile) {
                $htmlContent = file_get_contents($htmlFile->getPathname());
                $pdfContent = $this->pdfService->convertHtmlToPdf($htmlContent);
            } elseif ($url) {
                $pdfContent = $this->pdfService->convertUrlToPdf($url);
            } else {
                return new Response('Veuillez fournir une URL ou un fichier HTML.', 400);
            }

            return new Response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="converted.pdf"',
            ]);
        }

        return $this->render('convertisseur/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
