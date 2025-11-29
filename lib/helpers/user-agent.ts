export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'

export interface ParsedUserAgent {
  browser: {
    name: string
    version?: string
  }
  os: {
    name: string
    version?: string
  }
  deviceType: DeviceType
  isBot: boolean
  raw: string
}

const windowsVersionMap: Record<string, string> = {
  '10.0': '10',
  '11.0': '11',
  '6.3': '8.1',
  '6.2': '8',
  '6.1': '7',
  '6.0': 'Vista',
  '5.1': 'XP',
}

const botPattern = /(bot|crawler|spider|bingpreview|facebookexternalhit|slurp)/i

const sanitizeVersion = (version?: string) => {
  if (!version) return undefined
  const cleaned = version.replace(/[^0-9._-]/g, '')
  if (!cleaned) return undefined
  const parts = cleaned.split(/[_-]/).join('.').split('.')
  if (parts.length === 0) return undefined
  return parts.slice(0, 3).join('.')
}

const detectBrowser = (userAgent: string) => {
  const rules: Array<{ name: string; regex: RegExp; versionIndex?: number; exclude?: RegExp }> = [
    { name: 'Edge', regex: /Edg(?:e|A|iOS)?\/([\d.]+)/ },
    { name: 'Opera', regex: /OPR\/([\d.]+)/ },
    { name: 'Opera', regex: /Opera\/([\d.]+)/ },
    { name: 'Samsung Internet', regex: /SamsungBrowser\/([\d.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([\d.]+)/ },
    { name: 'Firefox', regex: /FxiOS\/([\d.]+)/ },
    { name: 'Chrome', regex: /Chrome\/([\d.]+)/, exclude: /OPR|Edg|Brave|SamsungBrowser/ },
    { name: 'Chrome', regex: /CriOS\/([\d.]+)/ },
    { name: 'Safari', regex: /Version\/([\d.]+).*Safari/ },
    { name: 'Safari', regex: /Safari\/([\d.]+)/ },
    { name: 'Internet Explorer', regex: /MSIE ([\d.]+)/ },
    { name: 'Internet Explorer', regex: /Trident\/.*rv:([\d.]+)/ },
    { name: 'Brave', regex: /Brave\/([\d.]+)/ },
  ]

  for (const rule of rules) {
    if (rule.exclude && rule.exclude.test(userAgent)) {
      continue
    }
    const match = userAgent.match(rule.regex)
    if (match) {
      return {
        name: rule.name,
        version: sanitizeVersion(match[rule.versionIndex ?? 1]),
      }
    }
  }

  if (/whatsapp/i.test(userAgent)) {
    return { name: 'WhatsApp', version: undefined }
  }

  return { name: 'Unknown Browser', version: undefined }
}

const detectOS = (userAgent: string) => {
  if (/Windows NT ([0-9.]+)/.test(userAgent)) {
    const versionMatch = userAgent.match(/Windows NT ([0-9.]+)/)
    const rawVersion = versionMatch ? versionMatch[1] : undefined
    const mapped = rawVersion ? (windowsVersionMap[rawVersion] ?? rawVersion) : undefined
    return { name: 'Windows', version: sanitizeVersion(mapped) }
  }

  if (/Mac OS X ([0-9_]+)/.test(userAgent)) {
    const match = userAgent.match(/Mac OS X ([0-9_]+)/)
    const version = match ? match[1].replace(/_/g, '.') : undefined
    return { name: 'macOS', version: sanitizeVersion(version) }
  }

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    const match = userAgent.match(/OS ([0-9_]+)/)
    const version = match ? match[1].replace(/_/g, '.') : undefined
    return { name: 'iOS', version: sanitizeVersion(version) }
  }

  if (/Android ([0-9.]+)/.test(userAgent)) {
    const match = userAgent.match(/Android ([0-9.]+)/)
    const version = match ? match[1] : undefined
    return { name: 'Android', version: sanitizeVersion(version) }
  }

  if (/CrOS/.test(userAgent)) {
    const match = userAgent.match(/CrOS [^ ]+ ([0-9.]+)/)
    const version = match ? match[1] : undefined
    return { name: 'Chrome OS', version: sanitizeVersion(version) }
  }

  if (/Linux/.test(userAgent)) {
    return { name: 'Linux', version: undefined }
  }

  if (/Windows Phone/.test(userAgent)) {
    const match = userAgent.match(/Windows Phone(?: OS)? ([0-9.]+)/)
    const version = match ? match[1] : undefined
    return { name: 'Windows Phone', version: sanitizeVersion(version) }
  }

  return { name: 'Unknown OS', version: undefined }
}

const detectDeviceType = (userAgent: string, isBot: boolean): DeviceType => {
  if (isBot) return 'bot'

  if (/Tablet|iPad/.test(userAgent)) {
    return 'tablet'
  }

  if (/Mobile|iPhone|Android/.test(userAgent) && !/iPad/.test(userAgent)) {
    return 'mobile'
  }

  return 'desktop'
}

export const parseUserAgent = (userAgent?: string): ParsedUserAgent => {
  const raw = userAgent ?? ''
  const normalized = raw.trim()

  if (!normalized) {
    return {
      browser: { name: 'Unknown Browser' },
      os: { name: 'Unknown OS' },
      deviceType: 'unknown',
      isBot: false,
      raw,
    }
  }

  const isBot = botPattern.test(normalized)
  const browser = detectBrowser(normalized)
  const os = detectOS(normalized)
  const deviceType = detectDeviceType(normalized, isBot)

  return {
    browser,
    os,
    deviceType,
    isBot,
    raw,
  }
}
