import {Box, Button, Card, Stack, Text} from '@sanity/ui'
import {useCurrentUser} from 'sanity'
import {isAdministrator} from '../lib/roles'

/**
 * Analytics is collected, not served, from here.
 *
 * gtag in `app/layout.tsx` reports every pageview to Google Analytics, which
 * needs no credentials because writing a pageview is something any visitor's
 * browser may do. Reading those figures back is the opposite direction and
 * requires a service account key proving ownership of the property — a secret
 * this site deliberately does not carry. So this pane points at the place the
 * data already lives instead of rendering a permanently-zeroed dashboard.
 */
const GA_URL = 'https://analytics.google.com/analytics/web/'

const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export default function AnalyticsPane() {
  const currentUser = useCurrentUser()
  const isAdmin = currentUser && isAdministrator(currentUser)

  if (!isAdmin) {
    return (
      <Box padding={4}>
        <Card padding={4} radius={2} tone="caution">
          <Text>You don&apos;t have permission to view analytics. Contact an administrator.</Text>
        </Card>
      </Box>
    )
  }

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Text as="h2" size={2} weight="bold">
          Site Analytics
        </Text>

        <Card padding={4} border radius={2} tone="primary">
          <Stack space={4}>
            <Text size={1} weight="semibold">
              Traffic for TV10 India is tracked in Google Analytics.
            </Text>
            <Text size={1} muted>
              Page views, live visitors, top stories and traffic sources are all under
              Reports. Use Reports &rarr; Realtime to see who is on the site right now.
            </Text>
            <Box>
              <Button
                as="a"
                href={GA_URL}
                target="_blank"
                rel="noopener noreferrer"
                text="Open Google Analytics"
                tone="primary"
              />
            </Box>
          </Stack>
        </Card>

        {measurementId && (
          <Text size={0} muted>
            Measurement ID: {measurementId}
          </Text>
        )}
      </Stack>
    </Box>
  )
}
