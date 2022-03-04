import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Xe May Tra Vinh'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
