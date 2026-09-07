import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const distrito = searchParams.get("distrito") || "";

    if (!q || q.trim().length < 3) {
      return NextResponse.json({ results: [] });
    }

    // Armar consulta contextualizada a Lima Metropolitana, Perú
    const queryParts = [q.trim()];
    if (distrito && !q.toLowerCase().includes(distrito.toLowerCase())) {
      queryParts.push(distrito);
    }
    queryParts.push("Lima", "Peru");
    const fullQuery = queryParts.join(", ");

    // Nominatim OSM con bounding box metropolitano
    // viewbox: [minLng, minLat, maxLng, maxLat] -> [-77.20, -12.35, -76.80, -11.75]
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("q", fullQuery);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("countrycodes", "pe");
    nominatimUrl.searchParams.set("viewbox", "-77.25,-12.35,-76.75,-11.75");
    nominatimUrl.searchParams.set("bounded", "0");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("limit", "6");

    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "Promundo-Sistema-Geocoding/1.0 (contacto@promundo.pe)",
        "Accept-Language": "es-PE,es;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn("Geocode upstream returned error:", res.status);
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ results: [] });
    }

    const results = data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      tipo: item.type,
      categoria: item.class,
      calle: item.address?.road || item.address?.pedestrian || "",
      numero: item.address?.house_number || "",
      distrito: item.address?.suburb || item.address?.city_district || item.address?.town || "",
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in geocode API proxy:", error);
    return NextResponse.json({ results: [] });
  }
}
