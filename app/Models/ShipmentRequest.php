<?php

namespace App\Models;

class ShipmentRequest
{
    public string $trackingNumber;
    public float $weightKg;
    public float $distanceKm;

    public function __construct(string $trackingNumber, float $weightKg, float $distanceKm)
    {
        $this->trackingNumber = $trackingNumber;
        $this->weightKg = $weightKg;
        $this->distanceKm = $distanceKm;
    }

    public function calculateCost(): float
    {
        $basePrice = 10000;
        
        $weightCost = $this->weightKg * 5000;
        
        // Tier pricing for distance
        if ($this->distanceKm > 100) {
            $distanceCost = $this->distanceKm * 2000;
        } elseif ($this->distanceKm > 50) {
            $distanceCost = $this->distanceKm * 1500;
        } else {
            $distanceCost = $this->distanceKm * 1000;
        }

        return $basePrice + $weightCost + $distanceCost;
    }
}
