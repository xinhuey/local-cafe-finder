# ☕ Cafe Finder

An interactive web app that displays cafés near your current location or in a searched city.  
It uses the **Google Maps JavaScript API (v=weekly)** and the **Places API (New)** to draw the map, list nearby cafés, and show photos, ratings, and addresses.

---

## ✨ Features

- **Live map** centered on your location or any searched city
- **Place search** using the new `Place.searchNearby` and `Place.searchByText` methods
- **Café details** with name, address, rating, and number of reviews
- **Photos** shown in the map info window **and** as thumbnails on sidebar cards
- Responsive layout with a scrollable sidebar list

---

## 🛠️ Technologies

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **APIs:** Google Maps JavaScript API + Places API (New)
- **Maps features:** `google.maps.Map`, `google.maps.InfoWindow`, `google.maps.LatLngBounds`, and `Place` methods (`searchNearby`, `searchByText`, `fetchFields`)

---

## 🚀 Setup Instructions

### 1️⃣ Create a Google Cloud project & API key

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. **Enable these APIs** for the project:
   - Maps JavaScript API
   - Places API (New)
4. Go to **APIs & Services → Credentials → Create credentials → API key**.
5. (Recommended) **Restrict the key**:
   - **Application restrictions:** HTTP referrers (your domain or `localhost`).
   - **API restrictions:** Maps JavaScript API and Places API.

Keep this key handy; you’ll put it in your script tag.

---

### 2️⃣ Clone or download this repository

```bash
git clone https://github.com/<your-username>/cafe-finder.git
cd cafe-finder

# For Python 3.x
python -m http.server 5500
```
