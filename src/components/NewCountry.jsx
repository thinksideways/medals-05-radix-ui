import { useState } from "react";
import { Dialog, Flex, Button, Text, TextField } from "@radix-ui/themes";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { tc } from "../Utils.js";

function NewCountry(props) {
  const [showDialog, setShowDialog] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");

  function hideDialog() {
    setNewCountryName("");
    setNewCountryCode("");
    setShowDialog(false);
  }
  function handleSave() {
    const trimmedName = newCountryName.trim();
    const trimmedCode = newCountryCode.trim().toUpperCase();
    if (trimmedName.length > 0 && trimmedCode.length > 0) {
      props.onAdd(trimmedName, trimmedCode);
      hideDialog();
    }
  }
  function handleKeyUp(e) {
    (e.keyCode ? e.keyCode : e.which) === 13 && handleSave();
  }
  const handleNameChange = (e) => {
    setNewCountryName(tc(e.target.value));
  };
  const handleCodeChange = (e) => {
    setNewCountryCode(e.target.value.toUpperCase());
  };

  return (
    <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
      <Dialog.Trigger>
        <Button size="2" color="green" variant="soft">
          <PlusCircledIcon />
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Add Country</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Enter the country name and official country code.
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              name="newCountryName"
              placeholder="Enter the country name"
              onChange={handleNameChange}
              value={newCountryName}
              autoComplete="off"
              onKeyUp={handleKeyUp}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Country Code
            </Text>
            <TextField.Root
              name="newCountryCode"
              placeholder="Enter the country code (e.g. US)"
              maxLength={10}
              onChange={handleCodeChange}
              value={newCountryCode}
              autoComplete="off"
              onKeyUp={handleKeyUp}
            />
          </label>
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={() => hideDialog()}>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              onClick={handleSave}
              disabled={
                newCountryName.trim().length === 0 ||
                newCountryCode.trim().length === 0
              }
            >
              Save
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default NewCountry;
