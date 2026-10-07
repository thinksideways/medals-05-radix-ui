import { useState, useRef } from "react";
import {
  Flex,
  Box,
  Text,
  TextField,
  Button,
  Badge,
  Callout,
  Spinner,
} from "@radix-ui/themes";
import {
  LockClosedIcon,
  PersonIcon,
  ExitIcon,
  InfoCircledIcon,
  CrossCircledIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

const TEST_ACCOUNTS = [
  { label: "Alice", email: "alice@foobar.com", role: "admin" },
  { label: "Mario", email: "mario@foobar.com", role: "post, patch, delete" },
  { label: "Delete", email: "delete@foobar.com", role: "delete only" },
  { label: "Patch", email: "patch@foobar.com", role: "patch only" },
  { label: "Post", email: "post@foobar.com", role: "post only" },
];

function LoginBanner({
  auth,
  onLogin,
  onLogout,
  authError,
  clearAuthError,
  actionError,
  clearActionError,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const passwordInputRef = useRef(null);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    if (clearAuthError) clearAuthError();
    if (clearActionError) clearActionError();

    await onLogin(email, password);
    setLoading(false);
  }

  // Autofills ONLY the email, requiring the user to type in the password
  function handleSelectUser(accountEmail) {
    setEmail(accountEmail);
    setPassword("");
    if (clearAuthError) clearAuthError();
    if (clearActionError) clearActionError();
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 50);
  }

  // --- LOGGED IN STATE ---
  if (auth?.user) {
    if (minimized) {
      return (
        <Box
          style={{
            position: "fixed",
            bottom: 16,
            left: 20,
            zIndex: 90,
          }}
        >
          <Button
            size="2"
            variant="surface"
            onClick={() => setMinimized(false)}
            style={{
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <PersonIcon />
            <Text weight="bold" size="2">
              {auth.user.firstName || auth.user.email}
            </Text>
            <ChevronUpIcon />
          </Button>
        </Box>
      );
    }

    return (
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          padding: "10px 24px",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          backgroundColor: "rgba(18, 24, 38, 0.92)",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.35)",
        }}
      >
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Flex align="center" gap="3" wrap="wrap">
            <Flex
              align="center"
              justify="center"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--accent-9)",
                color: "white",
              }}
            >
              <PersonIcon />
            </Flex>
            <Box>
              <Flex align="center" gap="2">
                <Text size="2" weight="bold">
                  {auth.user.firstName} {auth.user.lastName}
                </Text>
                <Text size="1" color="gray">
                  ({auth.user.email})
                </Text>
              </Flex>
              <Flex gap="1" mt="1" align="center" wrap="wrap">
                <Text size="1" color="gray" mr="1">
                  Roles:
                </Text>
                {auth.user.roles && auth.user.roles.length > 0 ? (
                  auth.user.roles.map((r) => (
                    <Badge key={r} size="1" color="blue" variant="solid">
                      {r}
                    </Badge>
                  ))
                ) : (
                  <Badge size="1" color="gray">
                    no roles
                  </Badge>
                )}
              </Flex>
            </Box>
          </Flex>

          {actionError && (
            <Callout.Root color="red" size="1" style={{ maxWidth: 480 }}>
              <Callout.Icon>
                <CrossCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                <Flex justify="between" align="center" gap="2">
                  <span>{actionError}</span>
                  <Button
                    size="1"
                    variant="ghost"
                    color="red"
                    onClick={clearActionError}
                  >
                    Dismiss
                  </Button>
                </Flex>
              </Callout.Text>
            </Callout.Root>
          )}

          <Flex align="center" gap="2">
            <Button
              size="2"
              color="red"
              variant="soft"
              onClick={onLogout}
              style={{ cursor: "pointer" }}
            >
              <ExitIcon /> Log Out
            </Button>
            <Button
              size="1"
              variant="ghost"
              color="gray"
              onClick={() => setMinimized(true)}
              title="Minimize banner"
            >
              <ChevronDownIcon />
            </Button>
          </Flex>
        </Flex>
      </Box>
    );
  }

  // --- NOT LOGGED IN STATE ---
  return (
    <Box
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 80,
        padding: "14px 24px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        borderTop: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 -6px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      <Flex direction="column" gap="2">
        {(authError || actionError) && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Flex justify="between" align="center">
                <span>{authError || actionError}</span>
                <Button
                  size="1"
                  variant="ghost"
                  color="red"
                  onClick={() => {
                    if (clearAuthError) clearAuthError();
                    if (clearActionError) clearActionError();
                  }}
                >
                  Dismiss
                </Button>
              </Flex>
            </Callout.Text>
          </Callout.Root>
        )}

        <Flex justify="between" align="center" wrap="wrap" gap="3">
          {/* Left section: status & user selection shortcuts */}
          <Box>
            <Flex align="center" gap="2" mb="1">
              <LockClosedIcon color="gold" />
              <Text size="2" weight="bold">
                Log In to Modify Medals
              </Text>
              <Badge color="orange" size="1" variant="surface">
                Read-Only Guest Mode
              </Badge>
            </Flex>
            <Flex align="center" gap="1" wrap="wrap">
              <Text size="1" color="gray" mr="1">
                Autofill Email:
              </Text>
              {TEST_ACCOUNTS.map((acc) => (
                <Button
                  key={acc.email}
                  size="1"
                  variant={email.toLowerCase() === acc.email.toLowerCase() ? "solid" : "outline"}
                  color="gray"
                  onClick={() => handleSelectUser(acc.email)}
                  style={{ cursor: "pointer", fontSize: "0.75rem" }}
                  title={`Select ${acc.email} (${acc.role})`}
                >
                  {acc.label}
                  <span style={{ opacity: 0.65, fontSize: "0.7rem", marginLeft: 4 }}>
                    ({acc.role})
                  </span>
                </Button>
              ))}
            </Flex>
          </Box>

          {/* Right section: credentials form */}
          <form onSubmit={handleSubmit} style={{ margin: 0 }}>
            <Flex align="center" gap="2" wrap="wrap">
              <TextField.Root
                size="2"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: 220 }}
                autoComplete="email"
                disabled={loading}
              />
              <TextField.Root
                ref={passwordInputRef}
                size="2"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: 170 }}
                autoComplete="current-password"
                disabled={loading}
              />
              <Button
                size="2"
                type="submit"
                variant="solid"
                color="blue"
                disabled={loading || !email || !password}
                style={{ cursor: "pointer", minWidth: 84 }}
              >
                {loading ? <Spinner size="1" /> : "Log In"}
              </Button>
            </Flex>
          </form>
        </Flex>
      </Flex>
    </Box>
  );
}

export default LoginBanner;
