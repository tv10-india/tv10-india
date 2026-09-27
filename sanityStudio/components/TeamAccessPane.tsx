import {Badge, Box, Card, Flex, Heading, Stack, Text} from '@sanity/ui'
import {useCurrentUser} from 'sanity'
import {isAdministrator, isApprover} from '../lib/roles'

/**
 * The "Team & Access" pane.
 *
 * The role gate is a Studio-side guardrail and, on this project's plan, usually
 * an inert one — every member is an `administrator` by default, so `isApprover`
 * passes for everybody. That caveat existed only as a source comment, which is
 * no use to the people it applies to. This pane says it out loud, to the signed-
 * in user, in the Studio, next to what they can actually do.
 */

type Capability = {
  label: string
  allowed: boolean
}

export default function TeamAccessPane() {
  const currentUser = useCurrentUser()

  if (!currentUser) {
    return (
      <Card padding={4}>
        <Text muted>Not signed in.</Text>
      </Card>
    )
  }

  const approver = isApprover(currentUser)
  const administrator = isAdministrator(currentUser)
  const roles = currentUser.roles || []

  const capabilities: Capability[] = [
    {label: 'Write articles and submit them for review', allowed: true},
    {label: 'Preview an article before it goes live', allowed: true},
    {label: 'Approve and publish an article', allowed: approver},
    {label: 'Send a submission back to the writer', allowed: approver},
    {label: 'Unpublish or delete an article', allowed: approver},
    {label: 'Publish or delete an advertisement booking', allowed: approver},
    {label: 'Publish or delete a web story', allowed: approver},
    {label: 'Add, edit or remove staff profiles', allowed: administrator},
  ]

  return (
    <Box padding={4}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={2}>{currentUser.name || 'Signed-in user'}</Heading>
          {currentUser.email && <Text muted>{currentUser.email}</Text>}
          <Flex gap={2} wrap="wrap">
            {roles.length > 0 ? (
              roles.map((role) => (
                <Badge key={role.name} tone="primary" mode="outline">
                  {role.title || role.name}
                </Badge>
              ))
            ) : (
              <Badge tone="caution">No role assigned</Badge>
            )}
          </Flex>
        </Stack>

        <Stack space={3}>
          <Heading size={1}>What you can do</Heading>
          <Stack space={2}>
            {capabilities.map((capability) => (
              <Card
                key={capability.label}
                padding={3}
                radius={2}
                tone={capability.allowed ? 'positive' : 'transparent'}
                border
              >
                <Flex align="center" gap={3}>
                  <Text size={2}>{capability.allowed ? '✅' : '🔒'}</Text>
                  <Text size={1} muted={!capability.allowed}>
                    {capability.label}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Stack>
        </Stack>

        {administrator && (
          <Card padding={4} radius={2} tone="caution" border>
            <Stack space={3}>
              <Heading size={1}>This gate is not switched on yet</Heading>
              <Text size={1}>
                You are an <strong>administrator</strong>, and on Sanity’s default setup every
                project member is one. That means every restriction listed above currently passes
                for everyone — including writers.
              </Text>
              <Text size={1}>
                To make it bite, open <strong>manage.sanity.io</strong> → your project →{' '}
                <strong>Members</strong>, and change each writer’s role from{' '}
                <strong>Administrator</strong> to <strong>Editor</strong> (can approve and publish)
                or <strong>Viewer</strong> (read-only). Anyone left as an administrator keeps full
                access.
              </Text>
              <Text size={1} muted>
                Worth being plain about: this is a guardrail against mistakes, not a security
                boundary. It stops a writer clicking the wrong button. It does not stop anyone
                holding an API token writing to the dataset directly — server-enforced custom roles
                are a paid Sanity plan feature.
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  )
}
