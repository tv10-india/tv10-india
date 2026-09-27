import {EyeOpenIcon} from '@sanity/icons'
import type {DocumentActionComponent} from 'sanity'

const previewArticle: DocumentActionComponent = ({draft, published}) => {
  const document = draft || published
  const slug = document?.slug as {current?: string} | undefined
  const articleSlug = slug?.current?.replace(/^\/+|\/+$/g, '')

  return {
    label: 'Preview article',
    icon: EyeOpenIcon,
    disabled: !articleSlug,
    onHandle: () => {
      if (!articleSlug) return
      window.open(`/news/${encodeURIComponent(articleSlug)}`, '_blank', 'noopener,noreferrer')
    },
  }
}

export default previewArticle
