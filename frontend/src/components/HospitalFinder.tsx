import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Hospital {
  name: string;
  lat: number;
  lon: number;
  distance?: number;
}

export function HospitalFinder() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const findNearby = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const radius = 1500; // 1.5 km
        
        const query = `
          [out:json];
          (
            node(around:${radius},${latitude},${longitude})[amenity=hospital];
            way(around:${radius},${latitude},${longitude})[amenity=hospital];
            node(around:${radius},${latitude},${longitude})[amenity=clinic];
            way(around:${radius},${latitude},${longitude})[amenity=clinic];
          );
          out center 20;
        `;

        try {
          const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
          });
          
          const data = await response.json();
          
          const hospitalList: Hospital[] = data.elements.map((el: any) => {
            const lat = el.lat || el.center?.lat || 0;
            const lon = el.lon || el.center?.lon || 0;
            const distance = calculateDistance(latitude, longitude, lat, lon);
            
            return {
              name: el.tags?.name || 'Unnamed Hospital',
              lat,
              lon,
              distance,
            };
          }).filter((h: Hospital) => h.distance && h.distance <= radius)
            .sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 5);

          setHospitals(hospitalList);
          if (hospitalList.length === 0) {
            setError('No hospitals found within 1.5km');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch hospitals');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError('Location access denied');
        setLoading(false);
      }
    );
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-2 border-emerald-300 shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600 animate-bounce" />
            <div>
              <h3 className="font-bold text-gray-800">
                {t.nav.nearbyHospitals}
              </h3>
              <p className="text-xs text-gray-600">Find hospitals within 1.5km</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={findNearby} 
            disabled={loading}
            className={`gap-2 ${loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Finding…
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Find {t.common.within1_5km}
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3">
            <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
            <p className="text-xs text-red-600 mt-1">Make sure location permission is enabled in your browser settings.</p>
          </div>
        )}
        
        {/* Hospitals List */}
        {hospitals.length > 0 ? (
          <div className="space-y-3">
            {/* Map Display */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">📍 Hospital Locations Map</p>
              <div className="h-48 rounded-lg border-2 border-emerald-200 overflow-hidden bg-gray-100 shadow-md">
                <iframe
                  title="Hospital map"
                  src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3766!2d${hospitals[0].lon}!3d${hospitals[0].lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v${Date.now()}&key=AIzaSyDI010MbT9t-gDE1zCApS3opd_WARKAbYU`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex={0}
                />
              </div>
              <p className="text-xs text-emerald-700 font-medium">Found {hospitals.length} hospitals nearby</p>
            </div>

            {/* Hospitals List */}
            <div className="space-y-2">
              {hospitals.map((hospital, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all"
                >
                  <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{hospital.name}</p>
                    <p className="text-emerald-600 text-sm font-medium">
                      📍 {hospital.distance ? `${(hospital.distance / 1000).toFixed(2)} km away` : 'Distance unknown'}
                    </p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}&key=AIzaSyDI010MbT9t-gDE1zCApS3opd_WARKAbYU`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-800 hover:underline text-xs font-semibold inline-flex items-center gap-1 mt-1"
                    >
                      🚗 Get Directions →
                    </a>
                  </div>
                  <a
                    href={`tel:100`}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    Call 108
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !error && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm font-medium">👆 Click "Find Hospitals" to locate nearby medical facilities</p>
              <p className="text-xs text-gray-500 mt-2">Your location will be used to find the closest hospitals</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
