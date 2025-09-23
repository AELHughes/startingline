'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Filter,
  Mail,
  Phone,
  Globe
} from 'lucide-react'

// Mock data for organisers - in a real app, this would come from an API
const mockOrganisers = [
  {
    id: '1',
    name: 'Cape Town Cycling Club',
    description: 'Premier cycling events across the Western Cape',
    location: 'Cape Town, Western Cape',
    eventsCount: 12,
    rating: 4.8,
    specialties: ['Road Cycling', 'Mountain Biking'],
    contact: {
      email: 'info@capetowncycling.co.za',
      phone: '+27 21 123 4567',
      website: 'www.capetowncycling.co.za'
    },
    logo: '/images/cycling-club-logo.jpg'
  },
  {
    id: '2',
    name: 'Gauteng Running Association',
    description: 'Organizing world-class running events in Gauteng',
    location: 'Johannesburg, Gauteng',
    eventsCount: 8,
    rating: 4.6,
    specialties: ['Road Running', 'Trail Running'],
    contact: {
      email: 'events@gautengrunning.org.za',
      phone: '+27 11 987 6543',
      website: 'www.gautengrunning.org.za'
    },
    logo: '/images/running-association-logo.jpg'
  },
  {
    id: '3',
    name: 'Durban Triathlon Club',
    description: 'Multi-sport events and triathlon training',
    location: 'Durban, KwaZulu-Natal',
    eventsCount: 6,
    rating: 4.9,
    specialties: ['Triathlon', 'Duathlon', 'Swimming'],
    contact: {
      email: 'contact@durbantriathlon.co.za',
      phone: '+27 31 555 1234',
      website: 'www.durbantriathlon.co.za'
    },
    logo: '/images/triathlon-club-logo.jpg'
  },
  {
    id: '4',
    name: 'Eastern Cape Adventure Sports',
    description: 'Adventure sports and outdoor events',
    location: 'Port Elizabeth, Eastern Cape',
    eventsCount: 4,
    rating: 4.4,
    specialties: ['Mountain Biking', 'Trail Running', 'Adventure Racing'],
    contact: {
      email: 'info@ecadventures.co.za',
      phone: '+27 41 777 8888',
      website: 'www.ecadventures.co.za'
    },
    logo: '/images/adventure-sports-logo.jpg'
  }
]

const SPECIALTY_OPTIONS = [
  'All Specialties',
  'Road Cycling',
  'Mountain Biking',
  'Road Running',
  'Trail Running',
  'Triathlon',
  'Duathlon',
  'Swimming',
  'Adventure Racing'
]

export default function OrganisersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties')
  const [locationFilter, setLocationFilter] = useState('All Locations')

  // Get unique locations for filter
  const locations = ['All Locations', ...Array.from(new Set(mockOrganisers.map(org => org.location.split(',')[1].trim())))]

  // Filter organisers
  const filteredOrganisers = mockOrganisers.filter(organiser => {
    const matchesSearch = organiser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organiser.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organiser.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = specialtyFilter === 'All Specialties' || 
                             organiser.specialties.some(s => s === specialtyFilter)
    
    const matchesLocation = locationFilter === 'All Locations' || 
                           organiser.location.includes(locationFilter)
    
    return matchesSearch && matchesSpecialty && matchesLocation
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Event Organisers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with experienced organisers who create amazing cycling, running, and triathlon events
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search organisers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredOrganisers.length} organisers found
            </div>
          </div>
        </div>

        {/* Organisers Grid */}
        {filteredOrganisers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No organisers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || specialtyFilter !== 'All Specialties' || locationFilter !== 'All Locations'
                ? 'Try adjusting your search or filters'
                : 'No organisers are currently available'
              }
            </p>
            {(searchTerm || specialtyFilter !== 'All Specialties' || locationFilter !== 'All Locations') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSpecialtyFilter('All Specialties')
                  setLocationFilter('All Locations')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganisers.map((organiser) => (
              <Card key={organiser.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{organiser.name}</CardTitle>
                      <CardDescription className="flex items-center text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {organiser.location}
                      </CardDescription>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {organiser.rating}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {organiser.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {organiser.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {organiser.eventsCount} events
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${organiser.contact.email}`} className="hover:text-blue-600">
                          {organiser.contact.email}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${organiser.contact.phone}`} className="hover:text-blue-600">
                          {organiser.contact.phone}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        <a 
                          href={`https://${organiser.contact.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          {organiser.contact.website}
                        </a>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full" size="sm">
                        View Events
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Are you an event organiser?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our platform and start creating amazing events. Connect with athletes, 
            manage registrations, and grow your event community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
