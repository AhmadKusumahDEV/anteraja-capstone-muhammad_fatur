<?php

namespace App\Enums;

enum NotificationTypeEnum: string
{
    case INFO     = 'INFO';
    case WARNING  = 'WARNING';
    case CRITICAL = 'CRITICAL';
    case SUCCESS  = 'SUCCESS';
}
