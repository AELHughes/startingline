import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'

// Create a DOM window for server-side sanitization
const window = new JSDOM('').window
const purify = DOMPurify(window)

// Configure DOMPurify to allow safe HTML elements and attributes
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'target', 'rel'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button']
}

/**
 * Sanitize HTML content to prevent XSS attacks while preserving safe formatting
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  try {
    // Sanitize the HTML
    const clean = purify.sanitize(html, sanitizeConfig)
    
    // Additional processing to ensure external links open in new tab
    return clean.replace(
      /<a\s+(?![^>]*target=)[^>]*href="https?:\/\/[^"]*"[^>]*>/gi,
      (match) => {
        if (!match.includes('target=')) {
          return match.replace('>', ' target="_blank" rel="noopener noreferrer">')
        }
        return match
      }
    )
  } catch (error) {
    console.error('HTML sanitization error:', error)
    // Return empty string if sanitization fails
    return ''
  }
}

/**
 * Extract plain text from HTML content for search indexing or previews
 * @param html - The HTML content to extract text from
 * @returns Plain text string
 */
export function extractTextFromHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  try {
    // First sanitize to remove any malicious content
    const sanitized = sanitizeHtml(html)
    
    // Create a temporary DOM element to extract text
    const tempDiv = window.document.createElement('div')
    tempDiv.innerHTML = sanitized
    
    return tempDiv.textContent || tempDiv.innerText || ''
  } catch (error) {
    console.error('Text extraction error:', error)
    return ''
  }
}

