<?php

namespace App\EventListener;

use App\Entity\User;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Twig\Environment;

#[AsEventListener(event: KernelEvents::EXCEPTION, priority: 10)]
final class AccessDeniedListener
{
    public function __construct(
        private readonly Environment $twig,
        private readonly TokenStorageInterface $tokenStorage,
    ) {
    }

    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        if (!$exception instanceof AccessDeniedException && !$exception instanceof AccessDeniedHttpException) {
            return;
        }

        // Don't intercept unauthenticated users — let Symfony redirect them to /login
        $token = $this->tokenStorage->getToken();
        if ($token === null || !$token->getUser() instanceof User) {
            return;
        }

        $request = $event->getRequest();
        $path    = $request->getPathInfo();

        if (str_starts_with($path, '/convertisseur/')) {
            if ($request->isMethod('POST')) {
                $event->setResponse(new JsonResponse(['error' => 'limit_reached'], 403));
                $event->stopPropagation();
                return;
            }
            $slug = basename($path);
            $event->setResponse(new RedirectResponse('/convertisseur?forbidden=' . urlencode($slug)));
            $event->stopPropagation();
            return;
        }

        // Fallback: render the custom 403 page
        $html = $this->twig->render('bundles/TwigBundle/Exception/error403.html.twig');
        $event->setResponse(new Response($html, 403));
        $event->stopPropagation();
    }
}
