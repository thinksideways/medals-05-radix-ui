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

const API_URL = "https://espressohex.com/medals/api/country";

function App() {
  const [appearance, setAppearance] = useState("dark");
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);

  useEffect(() => {
    async function loadCountries() {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error(`Failed to fetch countries (${res.status})`);
        }
        const data = await res.json();
        setCountries(data);
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

  async function handleAdd(name, code) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          code,
          gold: 0,
          silver: 0,
          bronze: 0,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to add country (${res.status})`);
      }
      const newCountry = await res.json();
      setCountries((prev) => [...prev, newCountry]);
    } catch (err) {
      console.error("Error adding country:", err);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to delete country (${res.status})`);
      }
      setCountries((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting country:", err);
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

  return (
    <Theme appearance={appearance}>
      <Button
        onClick={toggleAppearance}
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
        variant="ghost"
      >
        {appearance === "dark" ? <MoonIcon /> : <SunIcon />}
      </Button>
      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        <NewCountry onAdd={handleAdd} />
      </Flex>
      <Container className="bg"></Container>
      <Grid pt="2" gap="2" className="grid-container">
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
            .map((country) => (
              <Country
                key={country.id}
                country={country}
                medals={medals.current}
                onDelete={handleDelete}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))
        )}
      </Grid>
    </Theme>
  );
}

export default App;
