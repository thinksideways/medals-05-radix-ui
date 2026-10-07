import Medal from "./Medal";
import EditCountry from "./EditCountry";
import { Box, Table, Flex, Badge, Button } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { countryFlags } from "country-flags";

// Universal Save / Floppy Disk icon
function SaveIcon({ size = 15, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function Country(props) {
  function getMedalsTotal() {
    let sum = 0;
    props.medals.forEach((medal) => {
      sum += props.country[medal.name];
    });
    return sum;
  }

  const countryCode = props.country.code?.toUpperCase();
  const flag =
    (countryCode && countryFlags[countryCode]?.flag) ||
    Object.values(countryFlags).find(
      (c) => c.name.toLowerCase() === props.country.name?.toLowerCase()
    )?.flag ||
    null;

  return (
    <Box width="300px">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell colSpan="2">
              <Flex justify="between" align="center">
                <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                  {flag && (
                    <span
                      style={{ fontSize: "1.3rem", lineHeight: 1 }}
                      title={props.country.code || props.country.name}
                    >
                      {flag}
                    </span>
                  )}
                  <span style={{ fontWeight: 600 }}>{props.country.name}</span>
                  <Badge variant="outline">
                    {getMedalsTotal()}
                  </Badge>
                </Flex>
                <Flex gap="2" align="center">
                  {props.canPatch && (
                    <EditCountry
                      country={props.country}
                      onEdit={props.onEdit}
                    />
                  )}
                  {props.isDirty && props.canPatch && (
                    <Button
                      size="1"
                      color="green"
                      variant="soft"
                      onClick={() => props.onSave(props.country.id)}
                      title="Save medal count changes"
                      style={{ cursor: "pointer" }}
                    >
                      <SaveIcon />
                    </Button>
                  )}
                  {props.canDelete && (
                    <Button
                      color="red"
                      variant="ghost"
                      size="1"
                      onClick={() => props.onDelete(props.country.id)}
                      title="Delete country"
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.medals
            .sort((a, b) => a.rank - b.rank)
            .map((medal) => (
              <Medal
                key={medal.id}
                medal={medal}
                country={props.country}
                canPatch={props.canPatch}
                onIncrement={props.onIncrement}
                onDecrement={props.onDecrement}
              />
            ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

export default Country;
