import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Tag,
  Info,
  Loader2,
  MapPin,
  Link as LinkIcon,
  ArrowLeft,
  Monitor,
  GraduationCap,
  Palette,
  Heart,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import Layout from '../../components/admin/Layout';
import { eventService } from '../../services/api';
import { toast } from 'sonner';
import {
  MYANMAR_LOCATIONS_BY_STATE,
  type Location,
  type MyanmarState,
} from '../../constants/locations';

// Event categories with icons and descriptions
const EVENT_CATEGORIES = [
  {
    id: 'technology',
    label: 'Technology',
    description: 'Tech conferences, workshops, and meetups',
    icon: Monitor,
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Training sessions, seminars, and courses',
    icon: GraduationCap,
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Design thinking, UI/UX, and creative workshops',
    icon: Palette,
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Medical conferences and health awareness events',
    icon: Heart,
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Networking events, trade shows, and conferences',
    icon: Briefcase,
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other types of events',
    icon: MoreHorizontal,
  },
];

// Update the type at the top of the file
type EventStatus = 'pending' | 'completed';

export default function EventEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [selectedState, setSelectedState] = useState<MyanmarState | ''>('');

  // Update the form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
    location: '' as Location | '',
    stateRegion: '',
    locationType: 'onsite' as 'onsite' | 'remote',
    eventDate: '',
    startTime: '',
    endTime: '',
    organizer: '',
    category: 'technology',
    isFree: true,
    price: 0,
    maxAttendees: 0,
    meetingLink: '',
    address: '',
    status: 'pending' as EventStatus,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setFetchingEvent(true);
        if (!id) return;

        const event = await eventService.getEventById(id);

        // Set the state directly from the event data
        if (event.stateRegion) {
          setSelectedState(event.stateRegion as MyanmarState);
        }

        // Format the date and time from the event date
        const eventDate = new Date(event.eventDate);
        const formattedDate = eventDate.toISOString().split('T')[0];
        const hours = eventDate.getHours().toString().padStart(2, '0');
        const minutes = eventDate.getMinutes().toString().padStart(2, '0');
        const formattedStartTime = `${hours}:${minutes}`;

        // For end time, if it exists in the event, use it, otherwise default to start time + 1 hour
        let formattedEndTime = event.endTime;
        if (!formattedEndTime) {
          const endDate = new Date(eventDate);
          endDate.setHours(endDate.getHours() + 1);
          const endHours = endDate.getHours().toString().padStart(2, '0');
          const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
          formattedEndTime = `${endHours}:${endMinutes}`;
        }

        setFormData({
          name: event.name || '',
          description: event.description || '',
          coverImage: event.coverImage || '',
          location: (event.location || '') as Location | '',
          stateRegion: event.stateRegion || '',
          locationType: event.locationType || 'onsite',
          eventDate: formattedDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          organizer: event.organizer || '',
          category: event.category || 'technology',
          isFree: event.isFree !== undefined ? event.isFree : true,
          price: event.price || 0,
          maxAttendees: event.maxAttendees || 0,
          meetingLink: event.meetingLink || '',
          address: event.address || '',
          status: (event.status || 'pending') as EventStatus,
        });
      } catch (error: any) {
        toast.error(`Error fetching event: ${error.message}`);
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'locationType') {
      // Reset location-related fields when switching location types
      if (value === 'remote') {
        setFormData(prev => ({
          ...prev,
          locationType: 'remote',
          location: '', // Clear township/city
          stateRegion: '', // Clear state/region
          address: '', // Clear physical address
          meetingLink: prev.meetingLink || 'https://', // Set default meeting link prefix if empty
        }));
        setSelectedState(''); // Reset selected state
      } else {
        setFormData(prev => ({
          ...prev,
          locationType: 'onsite',
          meetingLink: '', // Clear meeting link
        }));
      }
    } else if (name === 'stateRegion') {
      setSelectedState(value as MyanmarState);
      setFormData(prev => ({
        ...prev,
        stateRegion: value,
        location: '', // Clear location when state changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // const handleSwitchChange = (name: string, checked: boolean) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: checked,
  //     // Reset price to 0 if event is free
  //     ...(name === 'isFree' && checked ? { price: 0 } : {}),
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Combine date and start time into a single Date object
      const [startHours, startMinutes] = formData.startTime.split(':');
      const eventDateTime = new Date(formData.eventDate);
      eventDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

      // Prepare event data based on location type
      const eventData = {
        ...formData,
        eventDate: eventDateTime.toISOString(),
        // Clear location fields for remote events
        location: formData.locationType === 'remote' ? '' : formData.location,
        stateRegion: formData.locationType === 'remote' ? '' : formData.stateRegion,
        address: formData.locationType === 'remote' ? '' : formData.address,
        // Ensure meeting link is only set for remote events
        meetingLink: formData.locationType === 'remote' ? formData.meetingLink : '',
      };

      console.log('Updating event data:', eventData);

      if (!id) {
        toast.error('Event ID is missing');
        return;
      }

      // Use the API to update event
      try {
        const response = await eventService.updateEvent(id, eventData);
        console.log('Event updated successfully:', response);
        toast.success('Event updated successfully!');

        // Redirect to dashboard
        navigate('/admin/dashboard');
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        console.error('Response data:', apiError.response?.data);
        console.error('Status code:', apiError.response?.status);
        toast.error(
          `Failed to update event: ${
            apiError.response?.data?.message || apiError.message || 'Unknown error'
          }`
        );
      }
    } catch (error: any) {
      console.error('General error updating event:', error);
      toast.error(`Error: ${error.message || 'Failed to update event'}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEvent) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground font-medium">Loading event details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {/* <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Make changes to your event details below
              </p>
            </div> */}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              Last edited {new Date().toLocaleDateString()}
            </span>
            {/* <span>•</span> */}
            {/* <span className="flex items-center">
              <Users className="h-4 w-4 mr-1.5" />
              {formData.maxAttendees || 0} registered
            </span> */}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="space-y-2 pb-7 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Info className="h-5 w-5 text-primary" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Update the essential details about your event</CardDescription>
                </div>
                <div className="flex h-5 items-center space-x-4 text-sm">
                  <div
                    className={`flex items-center space-x-2 ${
                      formData.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        formData.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}
                    />
                    <span className="font-medium capitalize">{formData.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 py-7">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Event Name*
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Description*
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImage" className="text-base font-semibold">
                    Cover Image URL
                  </Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                  {formData.coverImage && (
                    <div className="mt-2 rounded-lg overflow-hidden border h-48">
                      <img
                        src={formData.coverImage}
                        alt="Event cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="space-y-2 pb-7 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location Details
                  </CardTitle>
                  <CardDescription>Specify where your event will take place</CardDescription>
                </div>
                <div className="flex h-5 items-center space-x-4 text-sm">
                  <div
                    className={`flex items-center space-x-2 ${
                      formData.locationType === 'remote' ? 'text-blue-600' : 'text-green-600'
                    }`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        formData.locationType === 'remote' ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                    />
                    <span className="font-medium">
                      {formData.locationType === 'remote' ? 'Remote Event' : 'In-Person Event'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 py-7">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Event Type*</Label>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Remote Event</Label>
                      <p className="text-sm text-muted-foreground">
                        Event will be held online via video conference
                      </p>
                    </div>
                    <Switch
                      checked={formData.locationType === 'remote'}
                      onCheckedChange={checked =>
                        handleSelectChange('locationType', checked ? 'remote' : 'onsite')
                      }
                    />
                  </div>
                </div>

                {formData.locationType === 'remote' ? (
                  <div className="space-y-2">
                    <Label htmlFor="meetingLink" className="text-base font-semibold">
                      Meeting Link*
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="meetingLink"
                        name="meetingLink"
                        value={formData.meetingLink}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Enter meeting URL"
                        required={formData.locationType === 'remote'}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="stateRegion" className="text-base font-semibold">
                        State/Region*
                      </Label>
                      <Select
                        value={selectedState}
                        onValueChange={value => {
                          setSelectedState(value as MyanmarState);
                          handleSelectChange('stateRegion', value);
                          handleSelectChange('location', '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state/region" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(MYANMAR_LOCATIONS_BY_STATE).map(state => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-base font-semibold">
                        Township/City*
                      </Label>
                      <Select
                        value={formData.location}
                        onValueChange={value => handleSelectChange('location', value)}
                        disabled={!selectedState}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select township/city" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedState &&
                            MYANMAR_LOCATIONS_BY_STATE[selectedState as MyanmarState].map(
                              location => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              )
                            )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-base font-semibold">
                        Detailed Address
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter detailed address"
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date and Time Card */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="space-y-2 pb-7 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    Date & Time
                  </CardTitle>
                  <CardDescription>Set when your event will take place</CardDescription>
                </div>
                {formData.eventDate && (
                  <div className="text-sm text-muted-foreground">
                    {new Date(formData.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 py-7">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-base font-semibold">
                    Event Date*
                  </Label>
                  <Input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-base font-semibold">
                      Start Time*
                    </Label>
                    <Input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-base font-semibold">
                      End Time*
                    </Label>
                    <Input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details Card */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="space-y-2 pb-7 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Tag className="h-5 w-5 text-primary" />
                    Additional Details
                  </CardTitle>
                  <CardDescription>Set event category, capacity, and pricing</CardDescription>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                    <span className="font-medium">
                      {formData.isFree ? 'Free Event' : `$${formData.price}`}
                    </span>
                  </div>
                  {formData.maxAttendees > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        Max {formData.maxAttendees} attendees
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 py-7">
              <div className="grid gap-8">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Category*</Label>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {EVENT_CATEGORIES.map(category => {
                      const Icon = category.icon;
                      return (
                        <div
                          key={category.id}
                          className={`flex items-start space-x-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                            formData.category === category.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleSelectChange('category', category.id)}
                        >
                          <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium">{category.label}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Status*</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value =>
                      handleSelectChange('status', value as 'pending' | 'completed')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Attendee Limit</Label>
                  <Input
                    type="number"
                    id="maxAttendees"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    placeholder="Leave empty for unlimited attendees"
                    min="0"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Pricing</Label>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Free Event</Label>
                      <p className="text-sm text-muted-foreground">No charge for attendees</p>
                    </div>
                    <Switch
                      checked={formData.isFree}
                      onCheckedChange={checked => {
                        setFormData(prev => ({
                          ...prev,
                          isFree: checked,
                          price: checked ? 0 : prev.price,
                        }));
                      }}
                    />
                  </div>

                  {!formData.isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)*</Label>
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                        required={!formData.isFree}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="sticky bottom-0 left-0 right-0 py-4 px-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-10">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Event...
                    </>
                  ) : (
                    'Update Event'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
