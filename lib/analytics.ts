'use client'

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}

/**
 * Google Analytics tracking ID from environment variables
 */
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return !!GA_TRACKING_ID && typeof window !== 'undefined' && !!window.gtag
}

/**
 * Track page view
 */
export const trackPageView = (url: string): void => {
  if (!isAnalyticsEnabled()) return
  
  window.gtag?.('config', GA_TRACKING_ID!, {
    page_path: url,
  })
}

/**
 * Track custom event
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  if (!isAnalyticsEnabled()) return

  window.gtag?.('event', eventName, {
    ...params,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Predefined event trackers
 */
export const analytics = {
  // Hero carousel
  heroSlideView: (slideIndex: number, slideName: string) => {
    trackEvent('hero_slide_view', {
      slide_index: slideIndex,
      slide_name: slideName,
    })
  },

  // CTA clicks
  ctaClick: (ctaLocation: string, ctaText: string, targetUrl?: string) => {
    trackEvent('cta_click', {
      cta_location: ctaLocation,
      cta_text: ctaText,
      target_url: targetUrl,
    })
  },

  // Calendar interactions
  calendarTabChange: (tabName: string) => {
    trackEvent('calendar_tab_change', {
      tab_name: tabName,
    })
  },

  eventOpen: (eventId: string, eventType: string) => {
    trackEvent('event_open', {
      event_id: eventId,
      event_type: eventType,
    })
  },

  // Lead generation
  leadSubmit: (formName: string, contactMethod: string) => {
    trackEvent('lead_submit', {
      form_name: formName,
      contact_method: contactMethod,
    })
  },

  // WhatsApp clicks
  whatsappClick: (source: string, preFilledMessage?: string) => {
    trackEvent('whatsapp_click', {
      source: source,
      has_message: !!preFilledMessage,
    })
  },

  // Exit intent
  exitIntentShown: () => {
    trackEvent('exit_intent_shown', {})
  },

  exitIntentConvert: (action: string) => {
    trackEvent('exit_intent_convert', {
      action: action,
    })
  },

  exitIntentDismiss: () => {
    trackEvent('exit_intent_dismiss', {})
  },

  // Navigation
  navTileClick: (tileName: string, targetPage: string) => {
    trackEvent('nav_tile_click', {
      tile_name: tileName,
      target_page: targetPage,
    })
  },

  // Floating button
  floatingButtonClick: () => {
    trackEvent('floating_button_click', {})
  },

  // Pass/membership
  passDialogOpen: () => {
    trackEvent('pass_dialog_open', {})
  },

  passOptionView: (passType: string, price: number) => {
    trackEvent('pass_option_view', {
      pass_type: passType,
      price: price,
    })
  },
}

