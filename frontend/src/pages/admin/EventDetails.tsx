import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Users, Tag, Edit, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import Layout from '../../components/admin/Layout';
import { eventService } from '../../services/api';
// import { toast } from 'sonner';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) return;

        setLoading(true);
        const response = await eventService.getEventById(id);
        setEvent(response);
      } catch (error: any) {
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading event details...</span>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Event Not Found</CardTitle>
              <CardDescription>
                The event you're looking for doesn't exist or was deleted.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  // Format date for display
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedStartTime = event.startTime;
  const formattedEndTime = event.endTime;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Link to={`/admin/events/edit/${id}`} className="w-full sm:w-auto">
            <Button className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          </Link>
        </div>

        {/* Event Cover Image */}
        <div className="rounded-xl overflow-hidden h-[400px] mb-8 shadow-lg">
          <img
            src={event.coverImage || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Details */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/5 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold">{event.name}</CardTitle>
                <CardDescription className="mt-3 flex items-center text-base">
                  <Tag className="h-5 w-5 mr-2" />
                  <span className="capitalize font-medium">{event.category}</span>
                  <span className="mx-3">•</span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      event.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'deleted'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </CardDescription>
              </div>
              <div className="md:text-right">
                <p className="text-base font-medium text-muted-foreground">Organized by</p>
                <p className="text-lg font-semibold">{event.organizer}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 px-8 py-6">
            {/* Date, Time and Location */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <Calendar className="h-6 w-6 mr-4 mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Date & Time</h3>
                    <p className="text-lg mb-1">{formattedDate}</p>
                    <p className="text-muted-foreground">
                      {formattedStartTime} - {formattedEndTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-6 w-6 mr-4 mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Location</h3>
                    {event.locationType === 'onsite' ? (
                      <>
                        <p className="text-lg mb-1">{event.stateRegion}</p>
                        <p className="text-muted-foreground mb-2">{event.location}</p>
                        {event.address && <p className="text-muted-foreground">{event.address}</p>}
                      </>
                    ) : (
                      <>
                        <p className="text-lg mb-2">Remote Event</p>
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-block"
                        >
                          Join Meeting Link
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Users className="h-6 w-6 mr-4 mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Attendees</h3>
                    <p className="text-lg">
                      {event.currentAttendees} registered
                      {event.maxAttendees > 0 ? (
                        <span className="text-muted-foreground">
                          {' '}
                          / {event.maxAttendees} maximum
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="h-6 w-6 mr-4 mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Price</h3>
                    <p className="text-lg">
                      {event.isFree ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <span className="font-medium">${event.price.toFixed(2)}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="pt-6 border-t">
              <h3 className="font-semibold text-xl mb-4">About this event</h3>
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
