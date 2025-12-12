// Centro aproximado de Uruguay
const map = L.map("map").setView([-32.5, -56], 6);

// 1) Base: OSM (seguro y rápido para probar)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// 2) Ejemplo de WMS (CAMBIA ESTO LUEGO POR UN WMS REAL)
const ejemploWMS = L.tileLayer.wms(
  "https://ahocevar.com/geoserver/wms",
  {
    layers: "topp:states",
    format: "image/png",
    transparent: true,
  }
);

// 3) Capa de peces desde GeoJSON
let pecesLayer = null;
fetch("data/peces.geojson")
  .then((r) => r.json())
  .then((geojson) => {
    pecesLayer = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 6,
        }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const especie = props.especie || "Especie desconocida";
        const lugar = props.lugar || "";
        layer.bindPopup(`<b>${especie}</b><br>${lugar}`);
      },
    }).addTo(map);
  })
  .catch((err) => console.error("Error cargando peces.geojson:", err));

// 4) Capa de plantas desde GeoJSON
let plantasLayer = null;
fetch("data/plantas.geojson")
  .then((r) => r.json())
  .then((geojson) => {
    plantasLayer = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 6,
        }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const especie = props.especie || "Planta desconocida";
        const lugar = props.lugar || "";
        layer.bindPopup(`<b>${especie}</b><br>${lugar}`);
      },
    }).addTo(map);
  })
  .catch((err) => console.error("Error cargando plantas.geojson:", err));

// 5) Control de capas
const baseMaps = {
  "OpenStreetMap": osm,
};

const overlayMaps = {
  "Ejemplo WMS": ejemploWMS,
  "Peces": () => pecesLayer,
  "Plantas": () => plantasLayer,
};

// Leaflet no soporta funciones en overlayMaps, así que armamos cuando carguen
let overlaysReady = {};
function updateLayerControl() {
  overlaysReady = {};
  if (ejemploWMS) overlaysReady["Ejemplo WMS"] = ejemploWMS;
  if (pecesLayer) overlaysReady["Peces"] = pecesLayer;
  if (plantasLayer) overlaysReady["Plantas"] = plantasLayer;

  // Borramos controles previos
  if (map._layersControl) {
    map.removeControl(map._layersControl);
  }
  map._layersControl = L.control.layers(baseMaps, overlaysReady).addTo(map);
}

// Llamar periódicamente hasta que las capas estén listas
const intervalId = setInterval(() => {
  if (pecesLayer || plantasLayer || ejemploWMS) {
    updateLayerControl();
    clearInterval(intervalId);
  }
}, 500);
