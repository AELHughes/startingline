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

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      ticket_number: ticket.ticket_number,
      participant_name: `${ticket.participant_first_name} ${ticket.participant_last_name}`,
      event_name: ticket.event_name,
      distance_name: ticket.distance_name
    }))

    // Add QR code to the template
    const qrCodeElement = document.getElementById('qr-code')
    if (qrCodeElement) {
      const qrImage = document.createElement('img')
      qrImage.src = qrCodeData
      qrImage.style.width = '100%'
      qrImage.style.height = '100%'
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
