<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\File;

class ConvertisseurType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('url', UrlType::class, [
                'required' => false,
                'label' => 'Entrez l\'URL à convertir en PDF',
                'attr' => [
                    'placeholder' => 'https://example.com',
                ],
            ])
            ->add('htmlFile', FileType::class, [
                'required' => false,
                'label' => 'Ou importez un fichier HTML',
                'constraints' => [
                    new File([
                        'mimeTypes' => ['text/html'],
                        'mimeTypesMessage' => 'Veuillez envoyer un fichier HTML valide.',
                    ]),
                ],
            ]);
    }
}