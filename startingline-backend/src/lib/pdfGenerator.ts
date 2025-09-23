import puppeteer from 'puppeteer'
import { TicketData } from '../types/index'

export async function generatePDFTicket(ticketData: TicketData): Promise<Buffer> {
  let browser: puppeteer.Browser | null = null
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set viewport
    await page.setViewport({ width: 595, height: 842 })
    
    // Generate HTML for the ticket
    const html = generateTicketHTML(ticketData)
    
    // Set content
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    })
    
    return Buffer.from(pdf)
    
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate PDF ticket')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

function generateTicketHTML(ticketData: TicketData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Ticket</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 24px;
            background-color: #ffffff;
            box-sizing: border-box;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .logo {
            height: 40px;
            width: auto;
        }
        .organizer-logo {
            height: 40px;
            width: auto;
            max-width: 100px;
            object-fit: contain;
        }
        .title {
            text-align: center;
            margin-bottom: 24px;
        }
        .title h1 {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 8px 0;
        }
        .title-line {
            width: 80px;
            height: 3px;
            background-color: #2563eb;
            margin: 0 auto;
        }
        .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            height: calc(100% - 120px);
        }
        .card {
            background-color: #f8fafc;
            padding: 18px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .card-blue {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
        }
        .card-green {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
        }
        .card-yellow {
            background-color: #fefce8;
            border: 1px solid #fde047;
        }
        .card h2 {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 12px 0;
        }
        .detail-row {
            margin-bottom: 8px;
        }
        .detail-label {
            font-size: 12px;
            font-weight: 500;
            color: #64748b;
            display: block;
        }
        .detail-value {
            font-size: 13px;
            color: #111827;
            margin: 2px 0 0 0;
        }
        .detail-value-bold {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin: 2px 0 0 0;
        }
        .qr-section {
            text-align: center;
        }
        .qr-code {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            margin: 12px 0;
        }
        .ticket-number {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            color: #111827;
            margin: 2px 0 0 0;
        }
        .instructions {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .instruction-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }
        .bullet {
            color: #16a34a;
            font-size: 12px;
            line-height: 1.4;
            margin-top: 1px;
        }
        .instruction-text {
            font-size: 12px;
            color: #374151;
            margin: 0;
            line-height: 1.4;
        }
        .footer {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            color: #6b7280;
            margin: 0;
        }
        .footer .small {
            font-size: 10px;
            color: #9ca3af;
            margin: 4px 0 0 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <img src="https://startingline.co.za/Logo.png" alt="Starting Line" class="logo" />
        </div>
        ${ticketData.organizerLogo ? `<div><img src="${ticketData.organizerLogo}" alt="Organizer" class="organizer-logo" /></div>` : ''}
    </div>

    <div class="title">
        <h1>Event Ticket</h1>
        <div class="title-line"></div>
    </div>

    <div class="content">
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card">
                <h2>Event Details</h2>
                <div class="detail-row">
                    <span class="detail-label">Event:</span>
                    <p class="detail-value-bold">${ticketData.eventName}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <p class="detail-value">${new Date(ticketData.eventDate).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <p class="detail-value">${ticketData.eventTime}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <p class="detail-value">${ticketData.eventLocation}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Distance:</span>
                    <p class="detail-value">${ticketData.distanceName}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price:</span>
                    <p class="detail-value">R ${ticketData.distancePrice.toFixed(2)}</p>
                </div>
            </div>

            <div class="card card-blue">
                <h2>Participant Details</h2>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <p class="detail-value">${ticketData.participantName}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <p class="detail-value">${ticketData.participantEmail}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Mobile:</span>
                    <p class="detail-value">${ticketData.participantMobile}</p>
                </div>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card qr-section">
                <h2>Ticket Verification</h2>
                <div class="qr-code">
                    <!-- QR Code will be generated by the frontend and embedded here -->
                    <div style="width: 120px; height: 120px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <span style="font-size: 10px; color: #6b7280;">QR Code</span>
                    </div>
                </div>
                <div>
                    <span class="detail-label">Ticket Number:</span>
                    <p class="ticket-number">${ticketData.ticketNumber}</p>
                </div>
            </div>

            <div class="card card-green">
                <h2>Important Information</h2>
                <div class="instructions">
                    <div class="instruction-item">
                        <span class="bullet">•</span>
                        <p class="instruction-text">Please arrive 30 minutes before the event start time</p>
                    </div>
                    <div class="instruction-item">
                        <span class="bullet">•</span>
                        <p class="instruction-text">Bring a valid ID for verification</p>
                    </div>
                    <div class="instruction-item">
                        <span class="bullet">•</span>
                        <p class="instruction-text">This ticket is non-transferable</p>
                    </div>
                    <div class="instruction-item">
                        <span class="bullet">•</span>
                        <p class="instruction-text">Keep this ticket safe until after the event</p>
                    </div>
                    <div class="instruction-item">
                        <span class="bullet">•</span>
                        <p class="instruction-text">Contact the organizer for any questions</p>
                    </div>
                </div>
            </div>

            <div class="card card-yellow">
                <h2>Organizer</h2>
                <p class="detail-value">${ticketData.organizerName}</p>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Starting Line</strong> - Your premier event management platform</p>
        <p class="small">Generated on ${new Date().toLocaleDateString('en-ZA')} at ${new Date().toLocaleTimeString('en-ZA')}</p>
    </div>
</body>
</html>
  `
}
