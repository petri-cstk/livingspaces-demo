"use client";
import { useState, useEffect } from "react";
import { useDataContext } from "@/context/data.context";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ContentstackClient } from "@/lib/contentstack-client";
import { useJstag } from "@/context/lyticsTracking";

// Sample events data for Living Spaces (fallback only — real events come from the CMS)
// This array contains 20 furniture-retail events with title, description, dateTime, location, and optional image
export const sampleEvents = [
  {
    title: "Interior Design Consultation",
    description: "Book a complimentary one-on-one session with one of our design experts. Bring your room dimensions, photos, and inspiration, and we'll help you build a cohesive look for any space. Walk-ins welcome, appointments recommended.",
    dateTime: "Daily at 10:00 AM and 2:00 PM",
    location: "Design Studio",
    image: "/images/events/design-consultation.jpg"
  },
  {
    title: "Small-Space Styling Workshop",
    description: "Learn how to make the most of apartments and compact rooms with smart multi-functional furniture and clever storage. Our stylists share layout tricks and product picks that maximize every square foot.",
    dateTime: "Saturdays at 11:00 AM",
    location: "Living Room Gallery",
    image: "/images/events/small-space-styling.jpg"
  },
  {
    title: "Clearance Weekend Sale",
    description: "Save big across sofas, dining sets, bedroom collections, and décor during our clearance event. Floor models and last-chance pieces at their lowest prices. Delivery scheduling available on-site.",
    dateTime: "Fridays through Sundays",
    location: "Showroom Floor",
    image: "/images/events/clearance-sale.jpg"
  },
  {
    title: "New Season Collection Preview",
    description: "Be the first to see our latest arrivals in living, dining, and outdoor. Enjoy refreshments while our team walks you through the season's textures, tones, and standout pieces.",
    dateTime: "First Thursday of each month at 6:00 PM",
    location: "Front Showroom",
    image: "/images/events/collection-preview.jpg"
  },
  {
    title: "Mattress & Sleep Fitting",
    description: "Find your perfect mattress with a guided comfort fitting. Our sleep specialists help you compare firmness levels and adjustable bases so you can rest easy. No pressure, just great sleep advice.",
    dateTime: "Daily at 12:00 PM",
    location: "Mattress Gallery",
    image: "/images/events/mattress-fitting.jpg"
  },
  {
    title: "Outdoor Living Showcase",
    description: "Explore patio sets, fire tables, and weather-ready fabrics built for backyard entertaining. Our team shares care tips and layout ideas to bring your outdoor space to life.",
    dateTime: "Saturdays and Sundays at 1:00 PM",
    location: "Outdoor Patio",
    image: "/images/events/outdoor-living.jpg"
  },
  {
    title: "Color & Texture Masterclass",
    description: "Learn how designers layer palettes, materials, and finishes to create rooms that feel collected, not cluttered. Includes swatch samples and a take-home styling guide.",
    dateTime: "Wednesdays at 5:30 PM",
    location: "Design Studio",
    image: "/images/events/color-texture.jpg"
  },
  {
    title: "Sectional & Sofa Comfort Test",
    description: "Sit, recline, and compare our best-selling sectionals and sofas side by side. Find the right seat depth, cushion fill, and configuration for how your family really lives.",
    dateTime: "Daily at 3:00 PM",
    location: "Upholstery Gallery",
    image: "/images/events/sofa-comfort.jpg"
  },
  {
    title: "Kids' Room Design Event",
    description: "Discover playful, durable furniture and storage made for growing families. Get expert tips on creating safe, fun, and organized rooms your kids will love.",
    dateTime: "Sundays at 11:00 AM",
    location: "Kids & Teen Gallery",
    image: "/images/events/kids-room.jpg"
  },
  {
    title: "Home Office Setup Session",
    description: "Build a workspace that works. Our specialists help you choose ergonomic seating, desks, and storage to keep you comfortable and productive from home.",
    dateTime: "Tuesdays and Thursdays at 4:00 PM",
    location: "Office Furniture Gallery",
    image: "/images/events/home-office.jpg"
  },
  {
    title: "Dining Room Tablescape Workshop",
    description: "Set a beautiful table with our décor stylists. Learn to mix dinnerware, linens, and centerpieces for everyday meals and special gatherings alike.",
    dateTime: "Fridays at 6:00 PM",
    location: "Dining Gallery",
    image: "/images/events/tablescape.jpg"
  },
  {
    title: "Rug Layering Demo",
    description: "See how the right rug anchors a room. Our team demonstrates sizing, layering, and pairing techniques across styles from modern to traditional.",
    dateTime: "Saturdays at 2:00 PM",
    location: "Rug Gallery",
    image: "/images/events/rug-layering.jpg"
  },
  {
    title: "Financing & Delivery Info Session",
    description: "Learn about flexible financing options, white-glove delivery, and assembly services. Our team answers your questions so you can shop with confidence.",
    dateTime: "Daily at 4:30 PM",
    location: "Customer Care Desk",
    image: "/images/events/financing-info.jpg"
  },
  {
    title: "Lighting & Ambiance Workshop",
    description: "Transform any room with layered lighting. Explore floor lamps, pendants, and smart bulbs, and learn how to set the perfect mood for every space.",
    dateTime: "Wednesdays at 5:00 PM",
    location: "Lighting Gallery",
    image: "/images/events/lighting-workshop.jpg"
  },
  {
    title: "Members' Early Access Evening",
    description: "Living Spaces Rewards members get first pick of new arrivals and exclusive event pricing. Enjoy refreshments and personalized styling help from our team.",
    dateTime: "Last Friday of each month at 7:00 PM",
    location: "Front Showroom",
    image: "/images/events/members-early-access.jpg"
  },
  {
    title: "Décor & Accessories Styling Bar",
    description: "Drop by our styling bar for quick, expert advice on finishing touches — throw pillows, art, vases, and more — to complete your room.",
    dateTime: "Daily at 11:00 AM",
    location: "Décor Gallery",
    image: "/images/events/decor-styling.jpg"
  },
  {
    title: "Sustainable Materials Talk",
    description: "Learn about responsibly sourced woods, recycled fabrics, and durable finishes in our collections. Our team shares how to choose pieces that last.",
    dateTime: "Thursdays at 2:00 PM",
    location: "Design Studio",
    image: "/images/events/sustainable-materials.jpg"
  },
  {
    title: "Bedroom Refresh Workshop",
    description: "Create a restful retreat with expert tips on beds, nightstands, dressers, and bedding. Learn how to pull the whole room together on any budget.",
    dateTime: "Saturdays at 3:00 PM",
    location: "Bedroom Gallery",
    image: "/images/events/bedroom-refresh.jpg"
  },
  {
    title: "Holiday Entertaining Event",
    description: "Get ready to host with seasonal décor, extendable dining tables, and entertaining essentials. Enjoy styling demos and special event-only savings.",
    dateTime: "Select weekends (check calendar)",
    location: "Showroom Floor",
    image: "/images/events/holiday-entertaining.jpg"
  },
  {
    title: "Care & Protection Clinic",
    description: "Keep your furniture looking new. Our specialists demonstrate cleaning, fabric protection, and everyday care for upholstery, wood, and leather.",
    dateTime: "Tuesdays at 2:00 PM",
    location: "Customer Care Desk",
    image: "/images/events/care-clinic.jpg"
  }
];

// Helper function to get event days from Contentstack recur array
function getEventDays(recur) {
    if (!recur || !Array.isArray(recur)) {
        return [];
    }
    return recur;
}

// Helper function to format time from Contentstack date field (store-local timezone)
function getEventTime(date) {
    if (!date) return '';
    // Parse the date string as UTC and convert to store-local timezone
    const dateObj = new Date(date);
    // Format directly in store-local timezone
    return dateObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles'
    });
}

// Helper function to format dateTime string for display
function getEventDateTimeString(event) {
    const time = getEventTime(event.date);
    const days = event.recur || [];
    
    if (days.length === 7) {
        return `Daily at ${time}`;
    } else if (days.length === 1) {
        return `${days[0]}s at ${time}`;
    } else if (days.length > 1) {
        const dayNames = days.map(day => day + 's').join(', ');
        return `${dayNames} at ${time}`;
    }
    return time;
}

// Neutral greige placeholder (inline SVG) — no foreign brand asset; real images come from the CMS
const DEFAULT_EVENT_IMAGE = "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='640'%20height='480'%3E%3Crect%20width='640'%20height='480'%20fill='%23EBE6DF'/%3E%3C/svg%3E";

export default function Page(){
    const params = useParams();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entry, setEntry] = useState({});
    const [events, setEvents] = useState([]); // Will be used once JSON structure is provided
    const [isLoading, setIsLoading] = useState(true);
    const initialData = useDataContext();
    const jstag = useJstag();

    useEffect(() => {
        const fetchData = async () => {
          // Fetch events page content
          const data = await ContentstackClient.getElementByType("events_page", params.locale, null);
          if(data) {
            setEntry(data?.[0] ?? null);
            console.log("Events Page Entry:", data?.[0]);
          } else {
            setEntry(null);
          }

          // Fetch events from Contentstack
          const eventsData = await ContentstackClient.getElementByType("event", params.locale, null);
          if(eventsData) {
            console.log("Events from Contentstack:", eventsData);
            console.log("Events array:", eventsData);
            setEvents(eventsData);
          } else {
            console.log("No events found in Contentstack");
            setEvents([]);
          }
          
          setIsLoading(false);
        }
    
        ContentstackClient.onEntryChange(fetchData);
      }, [params.locale, initialData]);

    const openModal = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
        if (jstag && event?.taxonomies?.length > 0) {
            event.taxonomies.forEach((t) => {
                jstag.send({ topic_browsed: t.term_uid });
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    // Handle ESC key to close modal and prevent body scroll
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        const handleEscape = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    // Helper function to get audiences from taxonomies
    const getAudiences = (event) => {
        if (!event.taxonomies || !Array.isArray(event.taxonomies)) {
            return [];
        }
        const audienceTaxonomies = event.taxonomies.filter(
            tax => tax.taxonomy_uid === 'event_audiences'
        );
        return audienceTaxonomies.map(tax => tax.term_uid);
    };

    // Transform Contentstack events to match expected format
    const transformedEvents = events.map(event => ({
        title: event.title,
        description: event.description,
        location: event.location,
        dateTime: getEventDateTimeString(event),
        date: event.date,
        recur: event.recur || [],
        image: event.image?.url || null,
        uid: event.uid,
        audiences: getAudiences(event),
        taxonomies: event.taxonomies || []
    }));

    // Use Contentstack events if available, otherwise fall back to hardcoded
    const displayEvents = transformedEvents.length > 0 ? transformedEvents : sampleEvents;

    // Organize events by day for calendar view
    const eventsByDay = {};
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    weekDays.forEach(day => {
        eventsByDay[day] = [];
    });

    displayEvents.forEach(event => {
        const days = event.recur && event.recur.length > 0 
            ? event.recur 
            : getEventDays(event.dateTime);
        days.forEach(day => {
            if (eventsByDay[day]) {
                eventsByDay[day].push(event);
            }
        });
    });

    // Sort events by time within each day (chronologically from earliest to latest)
    Object.keys(eventsByDay).forEach(day => {
        eventsByDay[day].sort((a, b) => {
            // Use the date field for accurate time comparison
            const dateA = a.date ? new Date(a.date) : null;
            const dateB = b.date ? new Date(b.date) : null;
            
            if (dateA && dateB) {
                // Compare dates directly for accurate chronological sorting
                return dateA.getTime() - dateB.getTime();
            }
            
            // Fallback to string comparison if dates aren't available
            const timeA = a.date ? getEventTime(a.date) : getEventTime(a.dateTime);
            const timeB = b.date ? getEventTime(b.date) : getEventTime(b.dateTime);
            return timeA.localeCompare(timeB);
        });
    });

    if (isLoading) return;

    return(
        <>
            <Header locale={params.locale} />
            <div className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-8xl px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-medium text-3xl text-center tracking-widest text-neutral-700 uppercase">
                            {entry?.headline}
                        </h2>
                        {entry?.details && (
                            <p className="mt-2 font-paragraph font-light text-md whitespace-pre-wrap leading-8 text-neutral-700 italic">
                                {entry?.details}
                            </p>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="mx-auto mt-8 max-w-5xl flex justify-center">
                        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    List View
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    viewMode === 'calendar'
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Calendar View
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="mx-auto mt-16 max-w-5xl">
                            <div className="space-y-8">
                                {displayEvents.map((event, index) => (
                                    <article
                                        key={event.uid || index}
                                        className="relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-all duration-300 sm:flex-row"
                                    >
                                        {/* Timeline indicator */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-brand via-brand-dark to-black sm:left-0"></div>
                                        
                                        {/* Image section */}
                                        <div className="relative w-full h-48 sm:w-64 sm:h-auto sm:self-stretch sm:shrink-0 overflow-hidden flex items-stretch">
                                            <img 
                                                src={event.image || DEFAULT_EVENT_IMAGE} 
                                                alt={event.title}
                                                className="w-full h-full object-cover object-center"
                                            />
                                        </div>
                                        
                                        {/* Content section */}
                                        <div className="flex flex-1 flex-col p-6 sm:pl-8">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                                                <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-medium">{event.dateTime}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="font-medium">{event.location}</span>
                                                </div>

                                                {event.audiences && event.audiences.length > 0 && (
                                                    <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span className="font-medium capitalize">{event.audiences.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-xl font-paragraph font-semibold leading-7 text-gray-900 mb-3">
                                                {event.title}
                                            </h3>
                                            
                                            <p className="text-sm font-light font-paragraph leading-6 text-neutral-700">
                                                {event.description}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <div className="mx-auto mt-16 max-w-8xl">
                            {/* Day Headers Row */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7 mb-6">
                                {weekDays.map((day) => (
                                    <div key={day} className="flex flex-col">
                                        <div className="text-lg font-semibold text-gray-900 mb-2">
                                            {day}
                                        </div>
                                        <div className="h-1 bg-linear-to-r from-brand-dark to-brand rounded"></div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Events Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                                {weekDays.map((day) => (
                                    <div key={day} className="flex flex-col min-w-0">
                                        <div className="flex flex-col space-y-4">
                                            {eventsByDay[day].length > 0 ? (
                                                eventsByDay[day].map((event, eventIndex) => (
                                                    <div
                                                        key={`${day}-${eventIndex}`}
                                                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col flex-1 min-h-[200px]"
                                                    >
                                                        <div className="text-xs font-medium text-blue-600 mb-2">
                                                            {event.date ? getEventTime(event.date) : getEventTime(event.dateTime)}
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                            {event.title}
                                                        </h4>
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            {event.location}
                                                        </div>
                                                        {event.audiences && event.audiences.length > 0 && (
                                                            <div className="text-xs text-gray-500 mb-3 capitalize">
                                                                {event.audiences.join(', ')}
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => openModal(event)}
                                                            className="mt-auto text-left text-xs font-medium text-blue-600 hover:text-blue-800 underline self-start"
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[200px] flex items-center justify-center">
                                                    <div className="text-sm text-gray-400 italic">
                                                        No events scheduled
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Event Details Modal */}
            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

                    {/* Modal panel */}
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                            {/* Close button */}
                            <button
                                onClick={closeModal}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 z-10"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Image */}
                            <div className="relative w-full h-64 bg-linear-to-br from-brand-dark to-brand">
                                <img 
                                    src={selectedEvent.image || DEFAULT_EVENT_IMAGE} 
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="bg-white px-6 py-6 sm:px-8">
                                <h3 className="text-2xl font-paragraph font-semibold text-gray-900 mb-4">
                                    {selectedEvent.title}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-medium">{selectedEvent.dateTime}</span>
                                    </div>

                                    <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium">{selectedEvent.location}</span>
                                    </div>

                                    {selectedEvent.audiences && selectedEvent.audiences.length > 0 && (
                                        <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="font-medium capitalize">{selectedEvent.audiences.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <p className="text-sm font-light font-paragraph leading-6 text-neutral-700 whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
}