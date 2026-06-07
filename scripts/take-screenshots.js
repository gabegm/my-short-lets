const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const SCREENSHOTS_DIR = path.join(__dirname, 'public', 'screenshots')
const URLS = [
  { path: '/properties', file: 'properties.png', label: 'Properties Listing' },
  { path: '/properties/cozy-downtown-loft', file: 'property-detail.png', label: 'Property Detail' },
  { path: '/properties/beachside-cottage', file: 'property-detail-2.png', label: 'Property Detail (Cottage)' },
  { path: '/admin', file: 'admin-dashboard.png', label: 'Admin Dashboard' },
  { path: '/admin/requests', file: 'admin-requests.png', label: 'Admin - Requests' },
  { path: '/admin/properties', file: 'admin-properties.png', label: 'Admin - Properties' },
]

async function takeScreenshots() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  for (const { path: urlPath, file, label } of URLS) {
    console.log(`Taking screenshot: ${label} (${urlPath})`)
    await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: 'load' })
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, file), fullPage: false })
    // Small delay between screenshots
    await new Promise(r => setTimeout(r, 500))
  }

  await browser.close()
  console.log(`Screenshots saved to ${SCREENSHOTS_DIR}`)
}

takeScreenshots().catch(console.error)
