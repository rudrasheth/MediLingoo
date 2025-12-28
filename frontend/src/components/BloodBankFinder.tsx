
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Droplets, Locate, Loader2, Map, Navigation, LocateFixed } from "lucide-react";

interface BloodBank {
  name: string;
  address: string;
  placeId: string;
  lat: number;
  lng: number;
}

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const fetchNearbyBloodBanks = async (lat: number, lng: number): Promise<BloodBank[]> => {
  const radius = 5000; // 5km
  const type = "blood_bank";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=blood%20bank&key=${GOOGLE_PLACES_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.results) return [];
  return data.results.map((place: any) => ({
    name: place.name,
    address: place.vicinity,
    placeId: place.place_id,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }));
};
const BloodBankFinder = () => {
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState("Use your location to suggest the nearest blood bank.");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);

  const defaultCoords = { lat: 19.1197, lng: 72.8468 }; // Andheri East fallback

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("Location not supported on this device. Showing default area.");
      setCoords(defaultCoords);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationNote(`Nearest options around (${latitude.toFixed(4)}, ${longitude.toFixed(4)}).`);
        const banks = await fetchNearbyBloodBanks(latitude, longitude);
        setBloodBanks(banks);
      },
      async () => {
        setLocating(false);
        setCoords(defaultCoords);
        setLocationNote("Couldn't fetch location. Showing default area.");
        const banks = await fetchNearbyBloodBanks(defaultCoords.lat, defaultCoords.lng);
        setBloodBanks(banks);
      },
      { timeout: 8000 }
    );
  };

  const mapPoint = coords ?? defaultCoords;

  useEffect(() => {
    // On mount, try to fetch with default coords
    (async () => {
      const banks = await fetchNearbyBloodBanks(mapPoint.lat, mapPoint.lng);
      setBloodBanks(banks);
    })();
    // eslint-disable-next-line
  }, [mapPoint.lat, mapPoint.lng]);
  const bboxSize = 0.02; // ~2km box
  const bbox = [
    mapPoint.lng - bboxSize,
    mapPoint.lat - bboxSize,
    mapPoint.lng + bboxSize,
    mapPoint.lat + bboxSize,
  ].join("%2C");
  // Use Google Maps embed centered near user's location for blood bank search
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(`blood bank near ${mapPoint.lat},${mapPoint.lng}`)}&z=14&output=embed`;
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`blood bank near ${mapPoint.lat},${mapPoint.lng}`)}`;

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
      <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-800">
        <Droplets className="w-4 h-4 mt-0.5" />
        <div>
          <p className="font-semibold">Need blood urgently?</p>
          <p className="text-xs">Call the helplines below. Always confirm stock before arriving.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="gap-2" onClick={handleUseLocation} disabled={locating}>
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
          Use current location
        </Button>
        <p className="text-xs text-gray-600">{locationNote}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-rose-100 shadow-sm h-40">
        <iframe
          title="Blood bank map"
          src={mapUrl}
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.open(mapsSearchUrl, "_blank") }>
          <Map className="w-4 h-4" />
          Open in Google Maps
        </Button>
        <p className="text-xs text-gray-500">Defaults to a preset area if GPS is blocked.</p>
      </div>

      <div className="space-y-2">
        {bloodBanks.map((bank) => (
          <Card key={bank.placeId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{bank.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {bank.address}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => {
                    const url = coords
                      ? `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${bank.lat},${bank.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${bank.lat},${bank.lng}`;
                    window.open(url, "_blank");
                  }}>
                    <Navigation className="w-4 h-4" />
                    Directions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BloodBankFinder;
