import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, User, Clock, DollarSign, Phone, Mail } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { BookingWithGuest, Room } from "@shared/schema";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    booking: BookingWithGuest;
  };
}

const Calendar: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<BookingWithGuest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch bookings and rooms
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithGuest[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  // Filter bookings by selected room
  const filteredBookings = selectedRoom === "all" 
    ? bookings 
    : bookings.filter(booking => booking.room.id.toString() === selectedRoom);

  // Convert bookings to calendar events
  const calendarEvents: CalendarEvent[] = filteredBookings.map(booking => {
    const statusColors = {
      confirmed: { bg: "#3b82f6", border: "#2563eb" }, // blue
      checked_in: { bg: "#10b981", border: "#059669" }, // green
      checked_out: { bg: "#6b7280", border: "#4b5563" }, // gray
      cancelled: { bg: "#ef4444", border: "#dc2626" }, // red
      pending: { bg: "#f59e0b", border: "#d97706" }, // yellow
    };

    const colors = statusColors[booking.status as keyof typeof statusColors] || statusColors.pending;

    return {
      id: booking.id.toString(),
      title: `Room ${booking.room.number} - ${booking.guest.name}`,
      start: booking.checkInDate,
      end: booking.checkOutDate,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      extendedProps: {
        booking,
      },
    };
  });

  const handleEventClick = (eventInfo: any) => {
    setSelectedEvent(eventInfo.event.extendedProps.booking);
    setDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "checked_in": return "default";
      case "checked_out": return "secondary";
      case "cancelled": return "destructive";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  if (bookingsLoading || roomsLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading calendar...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon size={24} />
                Booking Calendar
              </h1>
              <p className="text-gray-600">View all room bookings and their dates</p>
            </div>
            
            {/* Room Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter by Room:</span>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      Room {room.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold">{filteredBookings.length}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {filteredBookings.filter(b => b.status === "confirmed").length}
                    </p>
                  </div>
                  <Badge variant="default">CONF</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Checked In</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredBookings.filter(b => b.status === "checked_in").length}
                    </p>
                  </div>
                  <Badge variant="default">IN</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Checked Out</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {filteredBookings.filter(b => b.status === "checked_out").length}
                    </p>
                  </div>
                  <Badge variant="secondary">OUT</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Room Booking Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  eventClick={handleEventClick}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,dayGridWeek"
                  }}
                  height="auto"
                  eventTextColor="#ffffff"
                  eventDisplay="block"
                  dayMaxEvents={3}
                  moreLinkClick="popover"
                  eventDidMount={(info) => {
                    info.el.title = `${info.event.title} (${info.event.extendedProps.booking.status})`;
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Booking Status Legend</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Checked In</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm">Checked Out</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Room {selectedEvent.room.number}</h3>
                <Badge variant={getStatusBadgeVariant(selectedEvent.status)}>
                  {selectedEvent.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span className="font-medium">{selectedEvent.guest.name}</span>
                </div>
                
                {selectedEvent.guest.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span>{selectedEvent.guest.phone}</span>
                  </div>
                )}
                
                {selectedEvent.guest.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span>{selectedEvent.guest.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span>
                    {format(new Date(selectedEvent.checkInDate), "MMM d, yyyy")} - {" "}
                    {format(new Date(selectedEvent.checkOutDate), "MMM d, yyyy")}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-500" />
                  <span>
                    ₹{selectedEvent.totalAmount} (Paid: ₹{selectedEvent.paidAmount || 0})
                  </span>
                </div>
                
                <div className="pt-2 border-t">
                  <span className="text-sm text-gray-600">Room Type:</span>
                  <p className="font-medium capitalize">{selectedEvent.room.type}</p>
                </div>
                
                {selectedEvent.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-gray-600">Notes:</span>
                    <p className="text-sm">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;