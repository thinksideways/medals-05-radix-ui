import { useState, useMemo } from "react";
import {
  Dialog,
  Flex,
  Button,
  Text,
  Select,
  TextField,
  Card,
  Box,
  Badge,
} from "@radix-ui/themes";
import { PlusCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { countryFlags } from "country-flags";

function NewCountry(props) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [search, setSearch] = useState("");

  // Convert countryFlags dictionary to a sorted list of { code, name, flag }
  const countryList = useMemo(() => {
    return Object.entries(countryFlags)
      .map(([code, item]) => ({
        code,
        name: item.name,
        flag: item.flag,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Codes already present on the board
  const existingCodes = useMemo(() => {
    return new Set(
      (props.existingCountries || []).map((c) => c.code?.toUpperCase())
    );
  }, [props.existingCountries]);

  // Filter countries by search query
  const filteredList = useMemo(() => {
    if (!search.trim()) return countryList;
    const q = search.trim().toLowerCase();
    const matched = countryList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
    // Ensure currently selected country remains in the options
    if (selectedCode && !matched.some((c) => c.code === selectedCode)) {
      const current = countryList.find((c) => c.code === selectedCode);
      if (current) return [current, ...matched];
    }
    return matched;
  }, [countryList, search, selectedCode]);

  const selectedCountry =
    selectedCode && countryFlags[selectedCode]
      ? { code: selectedCode, ...countryFlags[selectedCode] }
      : null;

  function hideDialog() {
    setSelectedCode("");
    setSearch("");
    setShowDialog(false);
  }

  function handleSave() {
    if (selectedCountry) {
      props.onAdd(selectedCountry.name, selectedCountry.code);
      hideDialog();
    }
  }

  function handleSearchKeyUp(e) {
    if ((e.keyCode ? e.keyCode : e.which) === 13) {
      if (selectedCountry) {
        handleSave();
      } else if (
        filteredList.length === 1 &&
        !existingCodes.has(filteredList[0].code.toUpperCase())
      ) {
        setSelectedCode(filteredList[0].code);
      }
    }
  }

  return (
    <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
      <Dialog.Trigger>
        <Button size="2" color="green" variant="soft" title="Add country">
          <PlusCircledIcon />
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="480px">
        <Dialog.Title>Add Country</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Select a country from the country flags registry to add it to the leaderboard.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <Box>
            <Text as="div" size="2" mb="1" weight="bold">
              Filter Countries
            </Text>
            <TextField.Root
              placeholder="Search by name or code (e.g. France, JP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={handleSearchKeyUp}
              autoComplete="off"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {/* Quick match suggestion chips when search query matches 1-5 countries */}
          {search.trim() &&
            filteredList.length > 0 &&
            filteredList.length <= 5 && (
              <Flex gap="1" wrap="wrap">
                {filteredList.map((c) => {
                  const isAdded = existingCodes.has(c.code.toUpperCase());
                  return (
                    <Button
                      key={c.code}
                      size="1"
                      variant={selectedCode === c.code ? "solid" : "soft"}
                      color={isAdded ? "gray" : "blue"}
                      disabled={isAdded}
                      onClick={() => setSelectedCode(c.code)}
                    >
                      {c.flag} {c.name} {isAdded ? "(Added)" : ""}
                    </Button>
                  );
                })}
              </Flex>
            )}

          <Box>
            <Text as="div" size="2" mb="1" weight="bold">
              Country Select
            </Text>
            <Select.Root
              value={selectedCode}
              onValueChange={setSelectedCode}
              size="3"
            >
              <Select.Trigger
                placeholder="Choose a country from list…"
                style={{ width: "100%" }}
              />
              <Select.Content position="popper" style={{ maxHeight: "260px" }}>
                {filteredList.length === 0 ? (
                  <Select.Item disabled value="__empty">
                    No matching countries found
                  </Select.Item>
                ) : (
                  filteredList.map((c) => {
                    const isAdded = existingCodes.has(c.code.toUpperCase());
                    return (
                      <Select.Item
                        key={c.code}
                        value={c.code}
                        disabled={isAdded}
                      >
                        {c.flag} {c.name} ({c.code})
                        {isAdded ? " — Already Added" : ""}
                      </Select.Item>
                    );
                  })
                )}
              </Select.Content>
            </Select.Root>
          </Box>

          {/* Selected Country Preview Card */}
          {selectedCountry && (
            <Card variant="surface" mt="1">
              <Flex align="center" gap="3">
                <Text size="8" style={{ lineHeight: 1 }}>
                  {selectedCountry.flag}
                </Text>
                <Box style={{ flex: 1 }}>
                  <Text as="div" size="3" weight="bold">
                    {selectedCountry.name}
                  </Text>
                  <Flex gap="2" align="center" mt="1">
                    <Badge color="blue" variant="soft">
                      Code: {selectedCountry.code}
                    </Badge>
                    <Text size="1" color="gray">
                      Medals start at 0
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </Card>
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={hideDialog}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleSave} disabled={!selectedCountry}>
            Add Country
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default NewCountry;
