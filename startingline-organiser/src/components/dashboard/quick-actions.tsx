import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Users, Settings } from 'lucide-react'

const actions = [
  {
    name: 'Create New Event',
    description: 'Set up a new race or event',
    href: '/dashboard/events/create',
    icon: Plus,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Export Attendees',
    description: 'Download participant data',
    href: '/dashboard/reports',
    icon: FileText,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    name: 'Manage Attendees',
    description: 'View and edit registrations',
    href: '/dashboard/attendees',
    icon: Users,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    name: 'Event Settings',
    description: 'Configure event options',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'bg-gray-500 hover:bg-gray-600',
  },
]

export function QuickActions() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link key={action.name} href={action.href}>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-gray-50"
            >
              <div className={`p-2 rounded-lg mr-3 text-white ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{action.name}</p>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  )
}


