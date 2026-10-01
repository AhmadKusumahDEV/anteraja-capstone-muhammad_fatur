<?php

namespace App\Enums;

enum ManifestTypeEnum: string
{
    case INBOUND_FEEDER    = 'INBOUND_FEEDER';
    case OUTBOUND_DISPATCH = 'OUTBOUND_DISPATCH';
}
