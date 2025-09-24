'use client'

import React from 'react'
import { Ticket } from '@/lib/api'

interface PDFTicketTemplateProps {
  ticket: Ticket
}

export default function PDFTicketTemplate({ ticket }: PDFTicketTemplateProps) {
  return (
    <div id="pdf-ticket" style={{
        width: '800px',
        height: '1132px',
        backgroundColor: '#FFFFFF',
        padding: '32px',
        fontFamily: 'sans-serif'
      }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1F2937',
        paddingBottom: '16px',
        marginBottom: '24px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }}>Event Ticket</h1>
          <div style={{
            color: '#4B5563',
            fontSize: '12px'
          }}>
            <p>Ticket #{ticket.ticket_number}</p>
          </div>
        </div>
        <div id="logo" style={{
          width: '100px',
          height: '40px',
          marginLeft: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}></div>
      </div>

      {/* Event Details */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>{ticket.event_name}</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <p style={{ color: '#4B5563' }}>Date</p>
            <p style={{ fontWeight: '600' }}>{new Date(ticket.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{ color: '#4B5563' }}>Time</p>
            <p style={{ fontWeight: '600' }}>{ticket.start_time}</p>
          </div>
          <div>
            <p style={{ color: '#4B5563' }}>Venue</p>
            <p style={{ fontWeight: '600' }}>{ticket.venue_name || 'TBA'}</p>
          </div>
          <div>
            <p style={{ color: '#4B5563' }}>Location</p>
            <p style={{ fontWeight: '600' }}>{ticket.city}</p>
          </div>
        </div>
      </div>

      {/* Participant Details */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>Participant Details</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <p style={{ color: '#4B5563' }}>Name</p>
            <p style={{ fontWeight: '600' }}>{ticket.participant_first_name} {ticket.participant_last_name}</p>
          </div>
          <div>
            <p style={{ color: '#4B5563' }}>Email</p>
            <p style={{ fontWeight: '600' }}>{ticket.participant_email}</p>
          </div>
          <div>
            <p style={{ color: '#4B5563' }}>Mobile</p>
            <p style={{ fontWeight: '600' }}>{ticket.participant_mobile}</p>
          </div>
          <div>
            <p style={{ color: '#4B5563' }}>Distance</p>
            <p style={{ fontWeight: '600' }}>{ticket.distance_name}</p>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>Emergency Contact</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <p style={{ color: '#4B5563' }}>Name</p>
            <p style={{ fontWeight: '600' }}>{ticket.emergency_contact_name}</p>
          </div>
          <div>
            <p style={{ color: '#4B5563' }}>Number</p>
            <p style={{ fontWeight: '600' }}>{ticket.emergency_contact_number}</p>
          </div>
        </div>
      </div>

      {/* Medical Info */}
      {(ticket.participant_medical_aid_name || ticket.participant_medical_aid_number) && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>Medical Aid Details</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {ticket.participant_medical_aid_name && (
              <div>
                <p style={{ color: '#4B5563' }}>Medical Aid</p>
                <p style={{ fontWeight: '600' }}>{ticket.participant_medical_aid_name}</p>
              </div>
            )}
            {ticket.participant_medical_aid_number && (
              <div>
                <p style={{ color: '#4B5563' }}>Medical Aid Number</p>
                <p style={{ fontWeight: '600' }}>{ticket.participant_medical_aid_number}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div id="qr-code" style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 8px'
        }}></div>
        <p style={{
          fontSize: '12px',
          color: '#1F2937'
        }}>Ticket #{ticket.ticket_number}</p>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        color: '#4B5563',
        fontSize: '14px',
        marginTop: '32px'
      }}>
        <p>This ticket must be presented at registration on the day of the event.</p>
        <p>For any queries, please contact the event organizer.</p>
      </div>
    </div>
  )
}
