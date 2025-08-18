import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Navigation } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Center {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
  phone?: string;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
}

export const NearbyCenters: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Location unavailable", description: "Enable location to find nearby centers.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => toast({ title: "Location blocked", description: "We couldn't access your location.", variant: "destructive" })
    );
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      if (!coords) return;
      setLoading(true);
      try {
        const query = `
          [out:json][timeout:25];
          (
            node(around:5000,${coords.lat},${coords.lon})[amenity=recycling];
            node(around:5000,${coords.lat},${coords.lon})[shop=scrap];
            node(around:5000,${coords.lat},${coords.lon})[amenity=waste_transfer_station];
          );
          out center 20;
        `;
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: query,
        });
        const data = await res.json();
        const list: Center[] = (data?.elements || []).map((el: any) => ({
          id: el.id,
          name: el.tags?.name || el.tags?.operator || "Recycling / Scrap Center",
          lat: el.lat ?? el.center?.lat,
          lon: el.lon ?? el.center?.lon,
          phone: el.tags?.phone || el.tags?.["contact:phone"] || undefined,
        })).filter((c: Center) => typeof c.lat === "number" && typeof c.lon === "number");

        // Sort by distance
        const sorted = list
          .map((c) => ({
            ...c,
            distance: haversine(coords.lat, coords.lon, c.lat, c.lon),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 8);

        setCenters(sorted);
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load centers", description: "Try again later.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, [coords]);

  const items = useMemo(() => centers, [centers]);

  return (
    <section aria-label="Nearby recycling centers" className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Nearby Centers</h3>
        <p className="text-muted-foreground text-sm">Call and navigate to a nearby recycling or scrap dealer.</p>
      </div>

      {loading && (
        <Card className="p-6 animate-pulse">
          <div className="h-4 w-40 bg-muted rounded mb-3"></div>
          <div className="h-3 w-full bg-muted rounded mb-2"></div>
          <div className="h-3 w-3/4 bg-muted rounded"></div>
        </Card>
      )}

      {!loading && items.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">No centers found within 5 km. Try enabling location services.</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((c) => {
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}`;
          return (
            <Card key={c.id} className="p-4 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">{c.name}</h4>
                  <p className="text-sm text-muted-foreground">Approx. {(haversine(coords!.lat, coords!.lon, c.lat, c.lon)/1000).toFixed(1)} km away</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                {c.phone && (
                  <Button asChild variant="secondary">
                    <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}>
                      <Phone /> Call
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${c.name}`}>
                    <Navigation /> Directions
                  </a>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default NearbyCenters;
