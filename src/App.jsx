import React, { useState, useEffect } from "react";
import "./index.css";
import "./App.css";
import weatherIcon from "./assets/weather.svg";
import unitsIcon from "./assets/units.svg";
import unitDropdown from "./assets/unit-dropdown.svg";
import searchIcon from "./assets/search-icon.svg";
import sunnyIcon from "./assets/icon-sunny.webp";
import cloudyIcon from "./assets/icon-partly-cloudy.webp";
import snowIcon from "./assets/icon-snow.webp";
import rainIcon from "./assets/icon-rain.webp";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function App() {
  const [location, setLocation] = useState("Berlin");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getWeatherIcon = (temp) => {
    if (temp > 25) return sunnyIcon;
    if (temp >= 15 && temp <= 25) return cloudyIcon;
    return rainIcon;
  };

  const getHourlyIcon = (code) => {
    if ([0, 1].includes(code)) return sunnyIcon;
    if ([2, 3].includes(code)) return cloudyIcon;
    if ([51, 61, 63, 71, 73].includes(code)) return rainIcon;
    if ([75, 80, 81, 85, 86].includes(code)) return snowIcon;
    return cloudyIcon;
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0)
        throw new Error("City not found");

      const { latitude, longitude, name, country } = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      setData({ ...weatherData, location: `${name}, ${country}` });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) setLocation(query.trim());
  };

  // if (loading) return <LoadingSkeleton />;

  // if (error)
  //   return (
  //     <div className="app-root">
  //       <div className="page">
  //         <p>Error: {error}</p>
  //       </div>
  //     </div>
  //   );

  const current = {
    temp: Math.round(data?.current?.temperature_2m),
    feeling: Math.round(
      data?.current?.apparent_temperature_2m || data?.current?.temperature_2m
    ),
    humidity: data?.current?.relative_humidity_2m,
    wind: `${data?.current?.wind_speed_10m} km/h`,
    precip: `${data?.current?.precipitation} mm`,
  };

  const loc = data?.location || "Unknown";

  const daily = data?.daily?.time.map((day, i) => ({
    day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
    hi: Math.round(data?.daily?.temperature_2m_max[i]),
    lo: Math.round(data?.daily?.temperature_2m_min[i]),
  }));

  return (
    <div className="app-root">
      <div className="page">
        <header className="topbar">
          <div className="brand">
            <div className="logo">
              <img src={weatherIcon} alt="Weather Icon" />
            </div>
          </div>

          <div className="units">
            <button className="units-btn">
              <img src={unitsIcon} alt="Units Icon" className="icon" /> Units
              <img src={unitDropdown} alt="Units Icon" className="icon" />
            </button>
          </div>
        </header>

        <main className="main">
          <h1 className="hero">How’s the sky looking today?</h1>

          {/* Search Bar */}
          <div className="search-row">
            <div className="search-input">
              <img src={searchIcon} alt="Search Icon" className="search-icon" />
              <input
                type="text"
                placeholder="Search for a place..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button className="search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="content-grid">
            {/* LEFT COLUMN */}
            <section className="left-column">
              {/* Hero Card */}
              {loading ? (
                <div className="card-list">
                  {[...Array(1)].map((_, i) => (
                    <div
                      className="daily-card"
                      style={{ height: 220, width: 800, alignItems: "center" }}
                      key={i}
                    >
                      <h1>Loading...</h1>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hero-card">
                  {loading ? (
                    <></>
                  ) : (
                    <>
                      {!error && (
                        <>
                          <div className="hero-left">
                            <div className="location">{loc}</div>
                            <div className="date">
                              {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div className="hero-right">
                            <img
                              src={getWeatherIcon(current.temp)}
                              alt="Weather Icon"
                            />
                            <div className="temp">{current.temp}°</div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {!loading && error && (
                    <div className="error">Error: {error}</div>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              {loading ? (
                <div className="daily-list">
                  {[...Array(4)].map((_, i) => (
                    <div
                      className="daily-card"
                      style={{ height: 80, width: 188 }}
                      key={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="quick-stats">
                  <div className="stat">
                    <div className="stat-title">Feels Like</div>
                    <div className="stat-value">{current.feeling}°</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Humidity</div>
                    <div className="stat-value">{current.humidity}%</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Wind</div>
                    <div className="stat-value">{current.wind}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Precipitation</div>
                    <div className="stat-value">{current.precip}</div>
                  </div>
                </div>
              )}

              {/* Daily Forecast */}
              <div className="daily-forecast">
                <h3>Daily forecast</h3>

                {loading ? (
                  <div className="daily-list">
                    {[...Array(7)].map((_, i) => (
                      <div
                        className="daily-card"
                        style={{ height: 150 }}
                        key={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="daily-list">
                    {daily?.length > 0 &&
                      daily?.map((d) => (
                        <div className="daily-card" key={d.day}>
                          <div className="daily-day">{d.day}</div>
                          <div className="daily-icon">
                            <img
                              src={getWeatherIcon(d.hi)}
                              alt="Weather Icon"
                            />
                          </div>
                          <div className="daily-temps">
                            <span className="hi">{d.hi}°</span>{" "}
                            <span className="lo">{d.lo}°</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT COLUMN */}
            <aside className="right-column">
              <div className="hourly-card">
                <div className="hourly-header">
                  <h4>Hourly forecast</h4>
                  <div className="dropdown">
                    <button
                      className="hourly-btn"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      Days
                      <img
                        src={unitDropdown}
                        alt="Units Icon"
                        className="icon"
                      />
                    </button>

                    {showDropdown && (
                      <ul className="dropdown-menu">
                        {daysOfWeek.map((day, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setSelectedDay(day);
                              setShowDropdown(false);
                            }}
                          >
                            {day}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="hour-list">
                    {[...Array(8)].map((_, i) => (
                      <div
                        className="daily-card"
                        style={{ height: 40, width: 300 }}
                        key={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="hourly-list">
                    {data?.hourly?.time &&
                      (() => {
                        const now = new Date();
                        const currentHourString = now
                          .toISOString()
                          .slice(0, 13);
                        const currentIndex = data.hourly.time.findIndex(
                          (time) => time.startsWith(currentHourString)
                        );
                        const startIndex =
                          currentIndex !== -1 ? currentIndex + 1 : 0;

                        return data.hourly.temperature_2m
                          .slice(startIndex, startIndex + 8)
                          .map((t, i) => {
                            const code =
                              data.hourly.weathercode?.[startIndex + i] ?? 0;

                            return (
                              <div className="hour-row" key={i}>
                                <div className="hour-left">
                                  <div className="hour-icon">
                                    <img
                                      src={getWeatherIcon(current.temp)}
                                      alt="Weather Icon"
                                    />
                                  </div>
                                  <div className="hour-time">
                                    {data.hourly.time?.[startIndex + i]?.slice(
                                      11,
                                      16
                                    ) ?? "--:--"}
                                  </div>
                                </div>
                                <div className="hour-right">
                                  {Math.round(t)}°
                                </div>
                              </div>
                            );
                          });
                      })()}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
