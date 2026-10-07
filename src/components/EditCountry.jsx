import { useState, useEffect } from "react";
import { Dialog, Flex, Grid, Button, Text, TextField } from "@radix-ui/themes";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { tc } from "../Utils.js";

function EditCountry({ country, onEdit }) {
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState(country.name);
  const [code, setCode] = useState(country.code);
  const [gold, setGold] = useState(country.gold);
  const [silver, setSilver] = useState(country.silver);
  const [bronze, setBronze] = useState(country.bronze);

  useEffect(() => {
    if (showDialog) {
      setName(country.name);
      setCode(country.code);
      setGold(country.gold);
      setSilver(country.silver);
      setBronze(country.bronze);
    }
  }, [showDialog, country]);

  function handleSave() {
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedName.length > 0 && trimmedCode.length > 0) {
      onEdit({
        id: country.id,
        name: trimmedName,
        code: trimmedCode,
        gold: Math.max(0, parseInt(gold, 10) || 0),
        silver: Math.max(0, parseInt(silver, 10) || 0),
        bronze: Math.max(0, parseInt(bronze, 10) || 0),
      });
      setShowDialog(false);
    }
  }

  function handleKeyUp(e) {
    if ((e.keyCode ? e.keyCode : e.which) === 13) {
      handleSave();
    }
  }

  return (
    <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
      <Dialog.Trigger>
        <Button size="1" color="gray" variant="ghost" title="Edit country">
          <Pencil2Icon />
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Edit Country</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Update country details and medal counts.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              name="editCountryName"
              placeholder="Enter the country name"
              value={name}
              onChange={(e) => setName(tc(e.target.value))}
              autoComplete="off"
              onKeyUp={handleKeyUp}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Country Code
            </Text>
            <TextField.Root
              name="editCountryCode"
              placeholder="Enter the country code (e.g. US)"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoComplete="off"
              onKeyUp={handleKeyUp}
            />
          </label>

          <Grid columns="3" gap="2">
            <label>
              <Text as="div" size="2" mb="1" weight="bold" color="amber">
                Gold
              </Text>
              <TextField.Root
                type="number"
                min="0"
                value={gold}
                onChange={(e) => setGold(e.target.value)}
                onKeyUp={handleKeyUp}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold" color="gray">
                Silver
              </Text>
              <TextField.Root
                type="number"
                min="0"
                value={silver}
                onChange={(e) => setSilver(e.target.value)}
                onKeyUp={handleKeyUp}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold" color="orange">
                Bronze
              </Text>
              <TextField.Root
                type="number"
                min="0"
                value={bronze}
                onChange={(e) => setBronze(e.target.value)}
                onKeyUp={handleKeyUp}
              />
            </label>
          </Grid>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              onClick={handleSave}
              disabled={name.trim().length === 0 || code.trim().length === 0}
            >
              Save
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default EditCountry;
