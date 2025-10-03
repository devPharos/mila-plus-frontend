import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "~/services/api";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function MapCount() {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchCountryData();
  }, []);

  async function fetchCountryData() {
    try {
      setLoading(true);
      const resp = await api.get("/enrollment-stats/by-country");
      const data = resp.data || {};

      setCountryData(data.countries || []);
      setTotalStudents(data.total_active_students || 0);
    } catch (err) {
      console.error("Error fetching country stats:", err);
      setCountryData([]);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  }

  const dataMap = countryData.reduce((acc, item) => {
    acc[item.country] = item.active_students;
    return acc;
  }, {});

  const maxStudents = countryData.length > 0
    ? Math.max(...countryData.map(c => c.active_students))
    : 0;

    const getColor = (countryName) => {
    const students = dataMap[countryName] || 0;

    if (students === 0) return "#e5e7eb";

    const logValue = Math.log10(students + 1);
    const maxLogValue = Math.log10(maxStudents + 1);
    const intensity = logValue / maxLogValue;

    const minLightness = 75;
    const maxLightness = 45;
    const lightness = minLightness - (intensity * (minLightness - maxLightness));

    return `hsl(250, 60%, ${lightness}%)`;
  };


  const handleClick = (geo, event) => {
    const countryName = geo.properties.name;
    const students = dataMap[countryName];

    if (students) {
      setTooltipContent(`${countryName}: ${students.toLocaleString()} students`);
    } else {
      setTooltipContent(`${countryName}: 0 students`);
    }

    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };

  const handleBackgroundClick = () => {
    setShowTooltip(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w mx-auto mt-10">
        <div className="flex gap-6 h-[360px]">
          <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
          <div className="w-80 bg-white rounded-lg p-6 shadow-lg border border-gray-200 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w mx-auto mt-10" onClick={handleBackgroundClick}>
      <div className="flex gap-6 h-[360px]">
        <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 208,
              center: [0, 30]
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={1}
              minZoom={1}
              maxZoom={8}
              center={[0, 30]}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getColor(countryName)}
                        stroke="#9ca3af"
                        strokeWidth={0.5}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleClick(geo, event);
                        }}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            fill: dataMap[countryName] ? "#a29bdc" : "#d1d5db",
                            outline: "none",
                            cursor: "pointer"
                          },
                          pressed: { outline: "none" }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {showTooltip && (
            <div
              className="fixed pointer-events-none z-50"
              style={{
                left: `${tooltipPosition.x + 10}px`,
                top: `${tooltipPosition.y + 10}px`,
              }}
            >
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                {tooltipContent}
                <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          )}
        </div>

        <div className="w-80 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Active students by Country
            </h2>
            <p className="text-sm text-gray-500">Real-time distribution</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between pb-2 border-b border-gray-200 mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Country</span>
              <span className="text-xs font-semibold text-gray-500 uppercase">Active Students</span>
            </div>

            <div className="max-h-[200px] overflow-y-auto pr-1">
              {countryData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No data available
                </div>
              ) : (
                countryData.map((country) => {
                  const percentage = (country.active_students / maxStudents) * 100;
                  return (
                    <div key={country.country} className="py-3 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-800">
                          {country.country === "United States of America" ? "United States" : country.country}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {country.active_students.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: "#8884d8"
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapCount;