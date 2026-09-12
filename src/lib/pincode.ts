// ==========================================================
// KILN STUDIO — Bengaluru & All-India Pincode Directory Service
// Auto-populates locality, city, and state for White-Glove Logistics
// ==========================================================

export interface PincodeInfo {
  locality: string;
  city: string;
  state: string;
  country: string;
}

// Comprehensive Bengaluru & Karnataka Pin-code Directory
export const BENGALURU_PINCODE_MAP: Record<string, { locality: string; district?: string }> = {
  // Central & Commercial
  "560001": { locality: "MG Road, Brigade Road, Ashok Nagar" },
  "560025": { locality: "Richmond Town, Langford Town, Victoria Layout" },
  "560002": { locality: "City Market, Chickpet" },
  "560009": { locality: "Majestic, Gandhinagar" },
  "560020": { locality: "Seshadripuram, Vasanth Nagar" },
  "560052": { locality: "Vasanth Nagar, High Grounds" },
  "560080": { locality: "Sadashivanagar, Palace Orchards" },

  // East Bengaluru & IT Corridors
  "560038": { locality: "Indiranagar 100ft Road, Defence Colony" },
  "560008": { locality: "Ulsoor, Halasuru, Old Madras Road" },
  "560071": { locality: "Domlur, HAL 2nd Stage, Airport Road" },
  "560075": { locality: "CV Raman Nagar, Kaggadasapura" },
  "560017": { locality: "HAL, Vimanapura, Murugeshpalya" },
  "560066": { locality: "Whitefield, Palm Meadows, Hope Farm" },
  "560067": { locality: "Kadugodi, Whitefield ITPL" },
  "560037": { locality: "Marathahalli, Kundalahalli" },
  "560103": { locality: "Bellandur, Outer Ring Road, Devarabisanahalli" },
  "560048": { locality: "Mahadevapura, Hoodi" },
  "560035": { locality: "Sarjapur Road, Doddakannelli, Carmelaram" },
  "560087": { locality: "Varthur, Gunjur" },

  // South Bengaluru & Tech Hubs
  "560034": { locality: "Koramangala 1st-4th Blocks" },
  "560095": { locality: "Koramangala 5th-8th Blocks, ST Bed" },
  "560102": { locality: "HSR Layout Sectors 1-7" },
  "560068": { locality: "Madivala, Bommanahalli, Roopena Agrahara" },
  "560100": { locality: "Electronic City Phase 1" },
  "560105": { locality: "Electronic City Phase 2, Doddathoguru" },
  "560076": { locality: "Bannerghatta Road, Hulimavu, Arekere" },
  "560083": { locality: "Gottigere, Bannerghatta Road" },
  "560041": { locality: "Jayanagar 4th Block, Tilak Nagar" },
  "560011": { locality: "Jayanagar 1st-3rd Blocks" },
  "560069": { locality: "Jayanagar 9th Block, Byrasandra" },
  "560078": { locality: "JP Nagar 1st-6th Phases" },
  "560070": { locality: "Banashankari 2nd & 3rd Stages, Padmanabhanagar" },
  "560085": { locality: "Banashankari 3rd Stage, Katriguppe" },
  "560004": { locality: "Basavanagudi, Shankarapuram" },
  "560019": { locality: "Gavipuram, NR Colony, Basavanagudi" },
  "560028": { locality: "Tyagarajanagar, Basavanagudi" },

  // West & North Bengaluru
  "560003": { locality: "Malleshwaram, Vyalikaval" },
  "560055": { locality: "Malleshwaram West, Subramanya Nagar" },
  "560010": { locality: "Rajajinagar 1st-6th Blocks" },
  "560079": { locality: "Basaveshwaranagar, Kamakshipalya" },
  "560022": { locality: "Yeshwanthpur, Peenya Industrial Area" },
  "560058": { locality: "Peenya 1st & 2nd Stages" },
  "560040": { locality: "Vijayanagar, RPC Layout" },
  "560072": { locality: "Nagarbhavi, Bangalore University Campus" },
  "560032": { locality: "RT Nagar, Ganganagar" },
  "560024": { locality: "Hebbal, Anand Nagar" },
  "560092": { locality: "Sahakara Nagar, Byatarayanapura" },
  "560064": { locality: "Yelahanka New Town" },
  "560065": { locality: "Yelahanka Old Town, Kogilu" },
  "560077": { locality: "Kothanur, Hennur Gardens" },
  "560043": { locality: "Banaswadi, HRBR Layout, Kalyan Nagar" },
  "560084": { locality: "Frazer Town, Pulikeshi Nagar, Cooke Town" },
  "560045": { locality: "Nagavara, Manyata Tech Park" },
  "560042": { locality: "Lingarajapuram, Kammanahalli" },
};

/**
 * Synchronous local dictionary lookup for instant keypress response.
 */
export function getPincodeDetailsSync(pincode: string): PincodeInfo | null {
  const clean = pincode.replace(/\D/g, "");
  if (clean.length !== 6) return null;

  const entry = BENGALURU_PINCODE_MAP[clean];
  if (entry) {
    return {
      locality: entry.locality,
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
    };
  }

  // If starts with 560 (Bengaluru Postal Zone), return clean Bengaluru defaults
  if (clean.startsWith("560")) {
    return {
      locality: "Bengaluru Urban",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
    };
  }

  return null;
}

/**
 * Full lookup with India Post Postal API fallback for nationwide addresses.
 */
export async function lookupPincode(pincode: string): Promise<PincodeInfo | null> {
  const clean = pincode.replace(/\D/g, "");
  if (clean.length !== 6) return null;

  // 1. Instant local dictionary hit
  const syncHit = getPincodeDetailsSync(clean);
  if (syncHit && syncHit.locality !== "Bengaluru Urban") {
    return syncHit;
  }

  // 2. Fetch from India Post API with 2500ms timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          locality: po.Name || po.Block || "Local Area",
          city: po.District || (clean.startsWith("560") ? "Bengaluru" : po.Block || "Bengaluru"),
          state: po.State || (clean.startsWith("56") ? "Karnataka" : "India"),
          country: "India",
        };
      }
    }
  } catch {
    // Network timeout or offline fallback
  }

  // 3. Resilient fallback for 560xxx or any 6-digit code
  if (clean.startsWith("560")) {
    return {
      locality: "Bengaluru Postal Division",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
    };
  }

  return null;
}
