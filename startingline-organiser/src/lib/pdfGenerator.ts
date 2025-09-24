import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { Ticket } from './api'

export async function generateTicketPDF(ticket: Ticket): Promise<void> {
  try {
    // Create an iframe to isolate styles
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.left = '-9999px'
    iframe.style.width = '800px'
    iframe.style.height = '1132px'
    document.body.appendChild(iframe)

    // Wait for iframe to load
    await new Promise<void>(resolve => {
      iframe.onload = () => resolve()
      iframe.src = 'about:blank'
    })

    // Get iframe document
    const iframeDoc = iframe.contentDocument!
    
    // Create a clean container
    const container = iframeDoc.createElement('div')
    iframeDoc.body.appendChild(container)

    // Create a React root and render the ticket template
    const root = iframeDoc.createElement('div')
    root.setAttribute('id', 'pdf-ticket-root')
    container.appendChild(root)

    // Import dynamically to avoid SSR issues
    const { default: PDFTicketTemplate } = await import('@/components/tickets/PDFTicketTemplate')
    const ReactDOM = await import('react-dom/client')
    const React = await import('react')

    // Create React root and render template
    const reactRoot = ReactDOM.createRoot(root)
    reactRoot.render(React.createElement(PDFTicketTemplate, { ticket }))

    // Wait for React to finish rendering
    await new Promise(resolve => setTimeout(resolve, 100))

    // Load and add logo
    let logoLoaded = false
    try {
      const logoImage = new Image()
      await new Promise((resolve, reject) => {
        logoImage.onload = () => {
          logoLoaded = true
          resolve(undefined)
        }
        logoImage.onerror = (error) => reject(new Error('Failed to load StartingLine logo: ' + error.message))
        logoImage.src = '/SL_Logo_WtV2.png'
      })

      // Only try to add the logo if it loaded successfully
      if (logoLoaded) {
        const logoElement = iframeDoc.getElementById('logo')
        if (logoElement) {
          const logoImg = iframeDoc.createElement('img')
          logoImg.src = logoImage.src
          logoImg.style.width = 'auto'
          logoImg.style.height = '100%'
          logoImg.style.objectFit = 'contain'
          logoElement.appendChild(logoImg)
        }
      }
    } catch (error) {
      console.warn('Logo loading failed:', error)
      // Continue without logo rather than failing the whole PDF generation
    }

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(ticket.ticket_number, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 100,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Add QR code to the template
    const qrCodeElement = iframeDoc.getElementById('qr-code')
    if (qrCodeElement) {
      const qrImage = iframeDoc.createElement('img')
      qrImage.src = qrCodeData
      qrImage.style.width = '100%'
      qrImage.style.height = '100%'
      qrImage.style.display = 'block'
      qrCodeElement.appendChild(qrImage)
    }

    // Convert the template to canvas
    const canvas = await html2canvas(iframeDoc.getElementById('pdf-ticket')!, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF'
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [800, 1132]
    })

    // Add the canvas to PDF
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      800,
      1132
    )

    // Download the PDF
    pdf.save(`${ticket.event_name} - ${ticket.participant_first_name} ${ticket.participant_last_name} - Ticket.pdf`)

    // Clean up
    reactRoot.unmount()
    document.body.removeChild(iframe)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
