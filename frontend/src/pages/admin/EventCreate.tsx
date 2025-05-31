import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Tag,
  Users,
  DollarSign,
  Info,
  Loader2,
  MapPin,
  User,
  Image as ImageIcon,
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import Layout from '../../components/admin/Layout';
import { eventService } from '../../services/api';
import { toast } from 'sonner';
import {
  MYANMAR_LOCATIONS_BY_STATE,
  type Location,
  type MyanmarState,
} from '../../constants/locations';

// Add this type definition near the top of the file
type CategoryType = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Event categories with icons and descriptions
const EVENT_CATEGORIES: CategoryType[] = [
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

export default function EventCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<MyanmarState | ''>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Form state
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'locationType') {
      // Reset address or meetingLink when switching location types
      if (value === 'remote') {
        setFormData(prev => ({
          ...prev,
          [name]: value as 'remote',
          address: '', // Clear address when switching to remote
          meetingLink: prev.meetingLink || 'https://', // Set default meeting link prefix
          stateRegion: '', // Clear state/region when switching to remote
          location: '', // Clear location when switching to remote
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value as 'onsite',
          meetingLink: '', // Clear meeting link when switching to onsite
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
      // Reset price to 0 if event is free
      ...(name === 'isFree' && checked ? { price: 0 } : {}),
    }));
  };

  // Preview image when URL changes
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, coverImage: value }));
    setPreviewImage(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Combine date and start time into a single Date object
      const [startHours, startMinutes] = formData.startTime.split(':');
      const eventDateTime = new Date(formData.eventDate);
      eventDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

      const eventData = {
        ...formData,
        eventDate: eventDateTime.toISOString(),
      };

      console.log('Submitting event data:', eventData);

      // Use the real API to create event
      try {
        const response = await eventService.createEvent(eventData);
        console.log('Event created successfully:', response);
        toast.success('Event created successfully!');

        // Redirect to dashboard
        navigate('/admin/dashboard');
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        console.error('Response data:', apiError.response?.data);
        console.error('Status code:', apiError.response?.status);
        const errorMessage =
          apiError.response?.data?.message || apiError.message || 'Failed to create event';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('General error creating event:', error);
      const errorMessage = error.message || 'Failed to create event';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Create New Event</h1>
          <p className="text-muted-foreground text-lg">
            Fill in the event details below to create a new event. All fields marked with * are
            required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Information Card */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-2 pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Info className="h-6 w-6 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-base">
                Provide the essential details about your event
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-8">
              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Event Name*
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter a descriptive name for your event"
                    className="text-base h-11"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Description*
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what your event is about, what attendees can expect..."
                    className="min-h-[120px] text-base resize-y"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="coverImage" className="text-base font-semibold">
                    Cover Image*
                  </Label>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Input
                        id="coverImage"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/image.jpg"
                        className="text-base h-11"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Provide a URL for your event cover image. Recommended size: 1200x630px
                      </p>
                    </div>
                    <div className="relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Cover preview"
                          className="rounded-lg object-cover w-full h-full"
                          onError={() => setPreviewImage('')}
                        />
                      ) : (
                        <div className="text-center p-6">
                          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground mt-3">
                            Image preview will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and Time Card */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-2 pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="h-6 w-6 text-primary" />
                Date & Time
              </CardTitle>
              <CardDescription className="text-base">
                Set when your event will take place
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-8">
              <div className="grid gap-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="eventDate" className="text-base font-semibold">
                      Event Date*
                    </Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="text-base h-11"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="startTime" className="text-base font-semibold">
                      Start Time*
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="text-base h-11"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="endTime" className="text-base font-semibold">
                      End Time*
                    </Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="text-base h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="organizer" className="text-base font-semibold">
                    Organizer*
                  </Label>
                  <div className="relative">
                    <Input
                      id="organizer"
                      name="organizer"
                      value={formData.organizer}
                      onChange={handleChange}
                      placeholder="Enter organizer or organization name"
                      className="pl-11 text-base h-11"
                      required
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-2 pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MapPin className="h-6 w-6 text-primary" />
                Location
              </CardTitle>
              <CardDescription className="text-base">
                Specify where your event will be held
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-8">
              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label htmlFor="locationType" className="text-base font-semibold">
                    Event Type*
                  </Label>
                  <Select
                    value={formData.locationType}
                    onValueChange={value => handleSelectChange('locationType', value)}
                  >
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">In Person Event</SelectItem>
                      <SelectItem value="remote">Online Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location Details*
                  </Label>
                  {formData.locationType === 'remote' ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Meeting name (e.g. Zoom Webinar)"
                          className="text-base h-11"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="meetingLink" className="text-base font-semibold">
                          Meeting Link*
                        </Label>
                        <Input
                          id="meetingLink"
                          name="meetingLink"
                          value={formData.meetingLink}
                          onChange={handleChange}
                          placeholder="e.g. https://zoom.us/j/123456789"
                          className="text-base h-11"
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Provide the virtual meeting link for attendees to join
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                          <Label htmlFor="state" className="text-base font-semibold">
                            State/Region*
                          </Label>
                          <Select
                            value={selectedState}
                            onValueChange={value => {
                              setSelectedState(value as MyanmarState);
                              setFormData(prev => ({
                                ...prev,
                                location: '',
                                stateRegion: value,
                              }));
                            }}
                          >
                            <SelectTrigger className="text-base h-11">
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

                        {selectedState && (
                          <div className="space-y-3">
                            <Label htmlFor="town" className="text-base font-semibold">
                              Town/City*
                            </Label>
                            <Select
                              value={formData.location}
                              onValueChange={value => handleSelectChange('location', value)}
                            >
                              <SelectTrigger className="text-base h-11">
                                <SelectValue placeholder="Select town/city" />
                              </SelectTrigger>
                              <SelectContent>
                                {MYANMAR_LOCATIONS_BY_STATE[selectedState].map(town => (
                                  <SelectItem key={town} value={town}>
                                    {town}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="address" className="text-base font-semibold">
                          Venue Address*
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter the complete venue address"
                          className="text-base min-h-[100px] resize-y"
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Provide the full address where the event will take place
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details Card */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-2 pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Tag className="h-6 w-6 text-primary" />
                Additional Details
              </CardTitle>
              <CardDescription className="text-base">
                Set event category, capacity, and pricing
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-8">
              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-semibold">
                    Category*
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => handleSelectChange('category', value)}
                  >
                    <SelectTrigger className="text-base h-11">
                      {formData.category && (
                        <>
                          {(() => {
                            const selectedCategory = EVENT_CATEGORIES.find(
                              cat => cat.id === formData.category
                            );
                            if (selectedCategory) {
                              return (
                                <div className="flex items-center gap-2.5">
                                  <selectedCategory.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                                  <span className="font-medium">{selectedCategory.label}</span>
                                </div>
                              );
                            }
                            return <SelectValue placeholder="Select category" />;
                          })()}
                        </>
                      )}
                      {!formData.category && <SelectValue placeholder="Select category" />}
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map(category => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="cursor-pointer focus:bg-primary/5 hover:bg-primary/5"
                        >
                          <div className="flex items-start gap-3 py-2">
                            <div className="mt-0.5">
                              <category.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-base">{category.label}</span>
                              <span className="text-sm text-muted-foreground">
                                {category.description}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-2" />

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="maxAttendees" className="text-base font-semibold">
                      Maximum Attendees
                    </Label>
                    <div className="relative">
                      <Input
                        id="maxAttendees"
                        name="maxAttendees"
                        type="number"
                        min="0"
                        value={formData.maxAttendees}
                        onChange={handleChange}
                        placeholder="Enter max number (0 for unlimited)"
                        className="pl-11 text-base h-11"
                      />
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Leave as 0 for unlimited attendees
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <Label htmlFor="isFree" className="text-base font-semibold">
                          Free Event
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle if this is a free event
                        </p>
                      </div>
                      <Switch
                        id="isFree"
                        checked={formData.isFree}
                        onCheckedChange={checked => handleSwitchChange('isFree', checked)}
                      />
                    </div>

                    {!formData.isFree && (
                      <div className="space-y-3">
                        <Label htmlFor="price" className="text-base font-semibold">
                          Price ($)*
                        </Label>
                        <div className="relative">
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter ticket price"
                            className="pl-11 text-base h-11"
                            required
                          />
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between py-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="w-[120px] h-11"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-[120px] h-11">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>

          {/* Help Text */}
          <Alert className="bg-muted/50">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-base font-semibold">Need Help?</AlertTitle>
            <AlertDescription className="text-sm mt-2">
              Make sure all required fields marked with * are filled out correctly. Your event will
              be reviewed before being published.
            </AlertDescription>
          </Alert>
        </form>
      </div>
    </Layout>
  );
}
