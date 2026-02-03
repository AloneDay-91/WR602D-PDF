<?php

namespace App\Entity;

use App\Repository\GenerationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GenerationRepository::class)]
class Generation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'generations')]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    private ?string $file = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * @var Collection<int, UserContact>
     */
    #[ORM\ManyToMany(targetEntity: UserContact::class, inversedBy: 'generations')]
    private Collection $userContacts;

    public function __construct()
    {
        $this->userContacts = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getFile(): ?string
    {
        return $this->file;
    }

    public function setFile(string $file): static
    {
        $this->file = $file;

        return $this;
    }

    public function getCreateadAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreateadAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * @return Collection<int, UserContact>
     */
    public function getUserContacts(): Collection
    {
        return $this->userContacts;
    }

    public function addUserContact(UserContact $userContact): static
    {
        if (!$this->userContacts->contains($userContact)) {
            $this->userContacts->add($userContact);
        }

        return $this;
    }

    public function removeUserContact(UserContact $userContact): static
    {
        $this->userContacts->removeElement($userContact);

        return $this;
    }

}
