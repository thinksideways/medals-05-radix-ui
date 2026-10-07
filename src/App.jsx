import { useState, useEffect, useRef } from "react";
import Country from "./components/Country";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
  Spinner,
  Text,
  Callout,
} from "@radix-ui/themes";
import { SunIcon, MoonIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";
import LoginBanner from "./components/LoginBanner";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/medals/api"
  : "https://espressohex.com/medals/api";

function App() {
  const [appearance, setAppearance] = useState("dark");
  const [countries, setCountries] = useState([]);
  const [savedMedals, setSavedMedals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication state
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem("nugatory_auth");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);

  useEffect(() => {
    async function loadCountries() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/country`);
        if (!res.ok) {
          throw new Error(`Failed to fetch countries (${res.status})`);
        }
        const data = await res.json();
        const baseline = {};
        data.forEach((c) => {
          baseline[c.id] = { gold: c.gold, silver: c.silver, bronze: c.bronze };
        });
        setCountries(data);
        setSavedMedals(baseline);
        setError(null);
      } catch (err) {
        console.error("Error loading countries:", err);
        setError("Failed to load countries from database.");
      } finally {
        setLoading(false);
      }
    }
    loadCountries();
  }, []);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }

  async function handleLogin(email, password) {
    try {
      setAuthError(null);
      setActionError(null);
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Login failed (${res.status})`);
      }

      const data = await res.json();
      setAuth(data);
      localStorage.setItem("nugatory_auth", JSON.stringify(data));
    } catch (err) {
      console.error("Login failed:", err);
      setAuthError(err.message || "Invalid email or password.");
    }
  }

  function handleLogout() {
    setAuth(null);
    localStorage.removeItem("nugatory_auth");
    setAuthError(null);
    setActionError(null);
  }

  function getAuthHeaders(extra = {}) {
    const headers = { ...extra };
    if (auth?.token) {
      headers["Authorization"] = `Bearer ${auth.token}`;
    }
    return headers;
  }

  async function handleAdd(name, code) {
    try {
      setActionError(null);
      const res = await fetch(`${API_BASE_URL}/country`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          name,
          code,
          gold: 0,
          silver: 0,
          bronze: 0,
        }),
      });

      if (res.status === 401) {
        setActionError("401 Unauthorized: Please log in with a role of 'admin' or 'medals-post' to add countries.");
        return;
      }
      if (res.status === 403) {
        const roles = auth?.user?.roles?.join(", ") || "none";
        setActionError(`403 Forbidden: Your roles [${roles}] do not permit adding countries (requires 'admin' or 'medals-post').`);
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to add country (${res.status})`);
      }

      const newCountry = await res.json();
      setCountries((prev) => [...prev, newCountry]);
      setSavedMedals((prev) => ({
        ...prev,
        [newCountry.id]: {
          gold: newCountry.gold,
          silver: newCountry.silver,
          bronze: newCountry.bronze,
        },
      }));
    } catch (err) {
      console.error("Error adding country:", err);
      setActionError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      setActionError(null);
      const res = await fetch(`${API_BASE_URL}/country/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        setActionError("401 Unauthorized: Please log in with a role of 'admin' or 'medals-delete' to delete countries.");
        return;
      }
      if (res.status === 403) {
        const roles = auth?.user?.roles?.join(", ") || "none";
        setActionError(`403 Forbidden: Your roles [${roles}] do not permit deleting countries (requires 'admin' or 'medals-delete').`);
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to delete country (${res.status})`);
      }

      setCountries((prev) => prev.filter((c) => c.id !== id));
      setSavedMedals((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      console.error("Error deleting country:", err);
      setActionError(err.message);
    }
  }

  async function handlePutCountry(updatedCountry) {
    try {
      setActionError(null);
      const res = await fetch(`${API_BASE_URL}/country/${updatedCountry.id}`, {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(updatedCountry),
      });

      if (res.status === 401) {
        setActionError("401 Unauthorized: Please log in with 'admin' or 'medals-patch' to update country details.");
        return;
      }
      if (res.status === 403) {
        const roles = auth?.user?.roles?.join(", ") || "none";
        setActionError(`403 Forbidden: Your roles [${roles}] do not permit updating country details (requires 'admin' or 'medals-patch').`);
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to update country (${res.status})`);
      }

      const saved = await res.json();
      setCountries((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      setSavedMedals((prev) => ({
        ...prev,
        [saved.id]: {
          gold: saved.gold,
          silver: saved.silver,
          bronze: saved.bronze,
        },
      }));
    } catch (err) {
      console.error("Error updating country:", err);
      setActionError(err.message);
    }
  }

  async function handlePatchMedals(countryId) {
    const country = countries.find((c) => c.id === countryId);
    const baseline = savedMedals[countryId];
    if (!country || !baseline) return;

    const patchOps = [];
    if (country.gold !== baseline.gold) {
      patchOps.push({ op: "replace", path: "/gold", value: country.gold });
    }
    if (country.silver !== baseline.silver) {
      patchOps.push({ op: "replace", path: "/silver", value: country.silver });
    }
    if (country.bronze !== baseline.bronze) {
      patchOps.push({ op: "replace", path: "/bronze", value: country.bronze });
    }
    if (patchOps.length === 0) return;

    try {
      setActionError(null);
      const res = await fetch(`${API_BASE_URL}/country/${countryId}`, {
        method: "PATCH",
        headers: getAuthHeaders({
          "Content-Type": "application/json-patch+json",
        }),
        body: JSON.stringify(patchOps),
      });

      if (res.status === 401) {
        setActionError("401 Unauthorized: Please log in with 'admin' or 'medals-patch' to save medal counts.");
        return;
      }
      if (res.status === 403) {
        const roles = auth?.user?.roles?.join(", ") || "none";
        setActionError(`403 Forbidden: Your roles [${roles}] do not permit saving medal counts (requires 'admin' or 'medals-patch').`);
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to patch country (${res.status})`);
      }

      const updated = await res.json();
      setSavedMedals((prev) => ({
        ...prev,
        [countryId]: {
          gold: updated.gold,
          silver: updated.silver,
          bronze: updated.bronze,
        },
      }));
    } catch (err) {
      console.error("Error patching country:", err);
      setActionError(err.message);
    }
  }

  function handleIncrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    if (idx === -1) return;
    const mutableCountries = [...countries];
    mutableCountries[idx] = {
      ...mutableCountries[idx],
      [medalName]: (mutableCountries[idx][medalName] || 0) + 1,
    };
    setCountries(mutableCountries);
  }

  function handleDecrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    if (idx === -1) return;
    const mutableCountries = [...countries];
    mutableCountries[idx] = {
      ...mutableCountries[idx],
      [medalName]: Math.max(0, (mutableCountries[idx][medalName] || 0) - 1),
    };
    setCountries(mutableCountries);
  }

  function getAllMedalsTotal() {
    let sum = 0;
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + (b[medal.name] || 0), 0);
    });
    return sum;
  }

  const roles = auth?.user?.roles || [];
  const canPost = roles.includes("admin") || roles.includes("medals-post");
  const canPatch = roles.includes("admin") || roles.includes("medals-patch");
  const canDelete = roles.includes("admin") || roles.includes("medals-delete");

  return (
    <Theme appearance={appearance}>
      <Flex p="2" px="6" className="fixedHeader" justify="between" align="center">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        <Flex align="center" gap="3">
          {canPost && (
            <NewCountry onAdd={handleAdd} existingCountries={countries} />
          )}
          <Button
            onClick={toggleAppearance}
            variant="ghost"
            size="2"
            title={appearance === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {appearance === "dark" ? <MoonIcon width="18" height="18" /> : <SunIcon width="18" height="18" />}
          </Button>
        </Flex>
      </Flex>
      <Container className="bg"></Container>
      <Grid pt="2" pb="9" gap="2" className="grid-container" style={{ paddingBottom: 110 }}>
        {loading ? (
          <Flex justify="center" align="center" p="6" style={{ gridColumn: "1 / -1" }}>
            <Spinner size="3" />
          </Flex>
        ) : error ? (
          <Flex justify="center" p="4" style={{ gridColumn: "1 / -1" }}>
            <Callout.Root color="red">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          </Flex>
        ) : countries.length === 0 ? (
          <Flex justify="center" p="4" style={{ gridColumn: "1 / -1" }}>
            <Text color="gray">No countries found.</Text>
          </Flex>
        ) : (
          countries
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((country) => {
              const baseline = savedMedals[country.id];
              const isDirty =
                Boolean(baseline) &&
                (country.gold !== baseline.gold ||
                  country.silver !== baseline.silver ||
                  country.bronze !== baseline.bronze);

              return (
                <Country
                  key={country.id}
                  country={country}
                  medals={medals.current}
                  isDirty={isDirty}
                  canPatch={canPatch}
                  canDelete={canDelete}
                  onSave={handlePatchMedals}
                  onEdit={handlePutCountry}
                  onDelete={handleDelete}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                />
              );
            })
        )}
      </Grid>

      {/* Floating Login & Role Footer Banner */}
      <LoginBanner
        auth={auth}
        onLogin={handleLogin}
        onLogout={handleLogout}
        authError={authError}
        clearAuthError={() => setAuthError(null)}
        actionError={actionError}
        clearActionError={() => setActionError(null)}
      />
    </Theme>
  );
}

export default App;
