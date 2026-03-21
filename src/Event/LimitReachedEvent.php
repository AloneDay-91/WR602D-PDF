<?php

namespace App\Event;

use App\Entity\User;

final class LimitReachedEvent
{
    public function __construct(public readonly User $user)
    {
    }
}
