let map, info, service;
const markers = [];
let userCenter = {lat: 43.6532, lng: -79.3832}; // Toronto

window.initMap = async function initMap(){
    //Default center (falls back if geolocation or search is not used)
    await google.maps.importLibrary("places");
    map = new google.maps.Map(document.getElementById("map"), {
    center: userCenter,
    zoom: 13,
  });
    info = new google.maps.InfoWindow(); // create a singular info window that can be reused by other markers 
    

    document.getElementById("locateBtn").addEventListener("click", locateMe);
    document.getElementById("searchBtn").addEventListener("click", () =>{
        const q = document.getElementById("query").value.trim();
        if (q) searchByText(q);
    });

    nearbyCafes(userCenter).catch(console.error);
};

async function locateMe(){
    if (!navigator.geolocation){
        alert("Geolocation not supported in this browser");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) =>{
            const loc = {lat:pos.coords.latitude, lng: pos.coords.longitude};
            map.setCenter(loc);
            map.setZoom(15);
            nearbyCafes(loc);
        },
        (err) => {
            console.warn(err);
            alert("Couldn't get your location. Try searching an area.");

        },
        {enableHighAccuracy: true, timeout: 100000}
    );
}



async function nearbyCafes(center){
    const {Place} = google.maps.places;

    const req = {
    fields: ["id","displayName","location","rating","userRatingCount","formattedAddress","photos"]
,
    locationRestriction: { center, radius: 1500 }, // meters
    includedPrimaryTypes: ["cafe"],
    maxResultCount: 20,
  };

  const {places} = await Place.searchNearby(req);
  renderPlaces(places, {fit: true});
}

async function searchByText(areaQuery){
    const {Place} = google.maps.places;

    const req = {
        fields: ["id","displayName","location","rating","userRatingCount","formattedAddress","photos"],

    textQuery: `cafe in ${areaQuery}`,
    maxResultCount: 20,
    };

    const {places} = await Place.searchByText(req);
    renderPlaces(places, {fit: true});
}

function renderPlaces(places, opts = {}) {
  clearMarkersAndList();

  const list = document.getElementById("list");
  const bounds = new google.maps.LatLngBounds();

  (places || []).forEach((p, idx) => {
    if (!p.location) return;

    const name = displayNameText(p);

    // Log ONE example so you can inspect fields
    if (idx === 0) console.log("[render] first place sample:", p);

    // Marker
    const marker = new google.maps.Marker({
      map,
      position: p.location,
      title: name
    });

    // Marker click: show big photo (if available)
    marker.addListener("click", async () => {
      try {
        console.log("[click] place:", p);
        let photoBlock = "";

        // Try to use existing photo object for attribution if present
        const photoObj = p?.photos?.[0];
        const imgSrc = await getPlacePhotoUrl(p, { width: 360, height: 240 });
        if (imgSrc) {
          photoBlock = `
            <div style="margin-top:8px">
              <img src="${imgSrc}" alt="${escapeHtml(name)} photo"
                   style="max-width:100%;height:auto;border-radius:8px"/>
              ${attributionHtml(photoObj)}
            </div>`;
        } else {
          console.log("[click] no photo available for this place");
        }

        info.setContent(`
          <strong>${escapeHtml(name)}</strong><br>
          ${escapeHtml(p.formattedAddress ?? "")}<br>
          ⭐ ${p.rating ?? "N/A"} (${p.userRatingCount ?? 0})
          ${photoBlock}
        `);
        info.open(map, marker);
      } catch (err) {
        console.error("[click] handler error:", err);
      }
    });

    markers.push(marker);
    bounds.extend(p.location);

    // Card: add thumbnail if available
    const card = document.createElement("div");
    card.className = "card";

    // Build the card synchronously with a placeholder, then fill photo async
    card.innerHTML = `
      <div class="card-media" style="margin-bottom:6px"></div>
      <div><strong>${escapeHtml(name)}</strong></div>
      <div>${escapeHtml(p.formattedAddress ?? "")}</div>
      <div>⭐ ${p.rating ?? "N/A"} (${p.userRatingCount ?? 0})</div>
    `;
    list.appendChild(card);

    // Async: fetch/insert card thumbnail (doesn't block rendering)
    (async () => {
      try {
        const thumb = await getPlacePhotoUrl(p, { width: 200, height: 120 });
        if (thumb) {
          const media = card.querySelector(".card-media");
          media.innerHTML = `
            <img src="${thumb}" alt="${escapeHtml(name)} thumbnail"
                loading = "lazy"
                 style="width:100%;height:auto;border-radius:6px;display:block"/>
          `;
        }
      } catch (e) {
        console.error("[card thumb] error:", e);
      }
    })();

    // Card click centers the map and triggers the marker click
    card.onclick = () => {
      map.panTo(marker.getPosition());
      map.setZoom(16);
      google.maps.event.trigger(marker, "click");
    };
  });

  if (opts.fit && !bounds.isEmpty()) map.fitBounds(bounds);
}



function clearMarkersAndList(){
    markers.forEach((m) => m.setMap(null));
    markers.length = 0;
    const list = document.getElementById("list");
    if (list) list.innerHTML = "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[s]));
}