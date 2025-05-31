import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Calendar,
  MapPin,
  Users,
  Tag,
  SlidersHorizontal,
  X,
  Loader2,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

import { eventService } from '../../services/api';
import Layout from '../../components/admin/Layout';
import { toast } from 'sonner';
import { Pagination } from '../../components/ui/pagination';

import type { LocationFilter } from '../../constants/locations';
import { HelpFooter } from '../../components/admin/HelpFooter.tsx';

// Define Event interface based on backend model
interface Event {
  _id: string;
  name: string;
  eventDate: string;
  location: string;
  stateRegion?: string;
  locationType: 'onsite' | 'remote';
  category: string;
  status: 'pending' | 'completed' | 'deleted';
  currentAttendees: number;
  maxAttendees: number;
  user: {
    _id: string;
    name: string;
  };
}

// Possible locations, categories, and attendee ranges
const locations = [
  'All Locations',
  'Yangon Region',
  'Mandalay Region',
  'Naypyitaw Union Territory',
  'Sagaing Region',
  'Bago Region',
  'Magway Region',
  'Tanintharyi Region',
  'Ayeyarwady Region',
  'Kachin State',
  'Kayah State',
  'Kayin State',
  'Chin State',
  'Mon State',
  'Rakhine State',
  'Shan State',
];
const categories = ['All Categories', 'technology', 'education', 'design', 'healthcare'];
const attendeeRanges = [
  { label: 'Any Size', value: 'any' },
  { label: 'Small (< 50)', value: 'small' },
  { label: 'Medium (50-100)', value: 'medium' },
  { label: 'Large (> 100)', value: 'large' },
];

// Add debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('All Locations');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [attendeeFilter, setAttendeeFilter] = useState('any');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
    debouncedSearch(value);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setIsFilterLoading(true);

      // Prepare filter parameters
      const params: any = {
        pageNumber: currentPage,
      };

      // Add filters if they are set
      if (debouncedSearchTerm) params.keyword = debouncedSearchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (locationFilter !== 'All Locations') params.stateRegion = locationFilter;
      if (categoryFilter !== 'All Categories') params.category = categoryFilter;
      if (dateFilter) params.date = dateFilter;

      // Get paginated events from the API
      const response = await eventService.getAllEvents(params);

      // Set events and pagination info
      setEvents(response.events || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.count || 0);
      setError('');
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
      setIsFilterLoading(false);
    }
  };

  // Update useEffect to use debounced search term
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    statusFilter,
    locationFilter,
    categoryFilter,
    dateFilter,
    attendeeFilter,
  ]);

  useEffect(() => {
    fetchEvents();
    if (isSearching) {
      setIsSearching(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, locationFilter, categoryFilter, dateFilter]);

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      setDeletingEvent(true);
      await eventService.deleteEvent(eventToDelete);
      toast.success('Event successfully deleted');
      fetchEvents(); // Refresh the event list
    } catch (error: any) {
      toast.error(`Failed to delete event: ${error.message}`);
    } finally {
      setDeletingEvent(false);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  // Count active filters
  const activeFilterCount = [
    statusFilter !== 'all',
    locationFilter !== 'All Locations',
    categoryFilter !== 'All Categories',
    dateFilter !== '',
    attendeeFilter !== 'any',
  ].filter(Boolean).length;

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setLocationFilter('All Locations');
    setCategoryFilter('All Categories');
    setDateFilter('');
    setAttendeeFilter('any');
  };

  // Filter events based on all filters
  // const filteredEvents = events; // Remove client-side filtering since we're using server pagination

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate statistics
  const completedEvents = events.filter(event => event.status === 'completed').length;
  const pendingEvents = events.filter(event => event.status === 'pending').length;
  const totalAttendees = events.reduce((sum, event) => sum + event.currentAttendees, 0);
  const averageAttendees = events.length ? Math.round(totalAttendees / events.length) : 0;

  const dashboardContent = (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <h3 className="text-2xl font-bold mt-2">{totalCount}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Active this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Events</p>
                <h3 className="text-2xl font-bold mt-2">{completedEvents}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>{((completedEvents / totalCount) * 100).toFixed(1)}% completion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Events</p>
                <h3 className="text-2xl font-bold mt-2">{pendingEvents}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <CalendarX className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Requiring attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                <h3 className="text-2xl font-bold mt-2">{totalAttendees}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>~{averageAttendees} per event</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events by name..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-input h-11"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              className="font-medium h-11 bg-white/80"
              onClick={() => setShowFilters(!showFilters)}
              disabled={isFilterLoading}
            >
              {isFilterLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <SlidersHorizontal className="h-4 w-4 mr-2" />
              )}
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            {/* Reset Button - Only show if filters are active */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground font-medium h-11"
                onClick={() => {
                  resetFilters();
                  setIsFilterLoading(true);
                }}
                disabled={isFilterLoading}
              >
                {isFilterLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Reset
              </Button>
            )}
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="mt-6 border rounded-lg border-border/50 p-4 bg-white/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={value => {
                      setStatusFilter(value);
                      setIsFilterLoading(true);
                    }}
                    disabled={isFilterLoading}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by status">
                        {isFilterLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </div>
                        ) : statusFilter === 'all' ? (
                          'All Status'
                        ) : (
                          statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    State/Region
                  </label>
                  <Select
                    value={locationFilter}
                    onValueChange={value => {
                      setLocationFilter(value as LocationFilter);
                      setIsFilterLoading(true);
                    }}
                    disabled={isFilterLoading}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by state/region">
                        {isFilterLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </div>
                        ) : (
                          locationFilter
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Date
                  </label>
                  <Input
                    type="date"
                    className="bg-background"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Event Type
                  </label>
                  <Select
                    value={categoryFilter}
                    onValueChange={value => {
                      setCategoryFilter(value);
                      setIsFilterLoading(true);
                    }}
                    disabled={isFilterLoading}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by type">
                        {isFilterLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </div>
                        ) : categoryFilter === 'All Categories' ? (
                          categoryFilter
                        ) : (
                          categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'All Categories'
                            ? category
                            : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Attendees Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Attendees
                  </label>
                  <Select value={attendeeFilter} onValueChange={value => setAttendeeFilter(value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by size" />
                    </SelectTrigger>
                    <SelectContent>
                      {attendeeRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events Table Section */}
      <Card className="shadow-md border-none bg-white/50 backdrop-blur-sm">
        <CardHeader className="px-6 py-5 border-b bg-white/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Event Dashboard</CardTitle>
              {/* <CardDescription className="mt-1.5">
                {!loading && !error ? (
                  <>
                    {filteredEvents.length} Events Found
                    {totalCount > filteredEvents.length && ` (${totalCount} total)`}
                  </>
                ) : error ? (
                  'Could not load events'
                ) : (
                  'Loading events...'
                )}
              </CardDescription> */}
            </div>
            <Link to="/admin/events/create">
              <Button className="font-medium h-11 px-6 shadow-sm bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            </Link>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-72 bg-white/30">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  {isSearching ? 'Searching events...' : 'Loading events...'}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-72 bg-white/30">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-medium mb-2">{error}</p>
                <Button variant="outline" onClick={fetchEvents} className="shadow-sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-72 bg-white/30">
              <div className="text-center max-w-md mx-auto px-4">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium mb-2">No events found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <Button variant="outline" onClick={resetFilters} className="shadow-sm">
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-b-lg overflow-hidden bg-white/30">
              <Table>
                <TableHeader className="bg-white/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Event Name</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Attendees</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(event => (
                    <TableRow key={event._id} className="hover:bg-white/50 transition-colors">
                      <TableCell className="font-medium py-4">
                        <div>
                          <span className="text-foreground/90">{event.name}</span>
                          <p className="text-xs text-muted-foreground mt-1 font-normal">
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-foreground/90">
                              {event.stateRegion || 'Remote Event'}
                            </span>
                          </div>
                          {event.locationType === 'onsite' && event.location && (
                            <div className="text-xs text-muted-foreground ml-4">
                              {event.location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            event.locationType === 'remote'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}
                        >
                          {event.locationType === 'remote' ? 'Online' : 'In Person'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            event.status === 'completed'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : event.status === 'deleted'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-4 font-medium">
                        {event.currentAttendees}{' '}
                        {event.maxAttendees > 0 ? `/ ${event.maxAttendees}` : ''}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/admin/events/${event._id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Event"
                              className="text-muted-foreground hover:text-foreground hover:bg-white/80"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/events/edit/${event._id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Event"
                              className="text-muted-foreground hover:text-foreground hover:bg-white/80"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Event"
                            className="text-destructive hover:text-destructive hover:bg-white/80"
                            onClick={() => handleDeleteClick(event._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, totalPages)}
          onPageChange={handlePageChange}
          isLoading={loading || isFilterLoading}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Delete Event</h2>
            <p className="mb-6 text-muted-foreground">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={deletingEvent}
                className="shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deletingEvent}
                className="shadow-sm"
              >
                {deletingEvent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Help Footer */}
      <HelpFooter />
    </div>
  );

  return <Layout>{dashboardContent}</Layout>;
}
