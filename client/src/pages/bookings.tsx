import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { BookingWithGuest } from "@shared/schema";

export default function Bookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery<BookingWithGuest[]>({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
    refetchInterval: 30000,
  });

  const checkInMutation = useMutation({
    mutationFn: (bookingId: number) => api.checkInGuest(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Success",
        description: "Guest has been checked in successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check in guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingId: number) => api.checkOutGuest(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Success",
        description: "Guest has been checked out successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check out guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="status-confirmed">Confirmed</Badge>;
      case "pending":
        return <Badge className="status-pending">Pending</Badge>;
      case "checked_in":
        return <Badge className="status-checked-in">Checked In</Badge>;
      case "checked_out":
        return <Badge variant="secondary">Checked Out</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoomTypeName = (type: string) => {
    switch (type) {
      case "standard": return "Standard Room";
      case "deluxe": return "Deluxe Suite";
      case "suite": return "Executive Suite";
      case "executive": return "Executive Suite";
      default: return "Room";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading bookings...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
            <p className="text-gray-600">Manage reservations, check-ins, and check-outs</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No bookings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {getInitials(booking.guest.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.guest.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.guest.email || 'No email'}
                                </div>
                                {booking.guest.phone && (
                                  <div className="text-sm text-gray-500">
                                    {booking.guest.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Room {booking.room.number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getRoomTypeName(booking.room.type)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.checkInDate)}
                            </div>
                            {booking.actualCheckIn && (
                              <div className="text-xs text-gray-500">
                                Actual: {formatDateTime(new Date(booking.actualCheckIn))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.checkOutDate)}
                            </div>
                            {booking.actualCheckOut && (
                              <div className="text-xs text-gray-500">
                                Actual: {formatDateTime(new Date(booking.actualCheckOut))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${parseFloat(booking.totalAmount).toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Paid: ${parseFloat(booking.paidAmount || "0").toFixed(0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {booking.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  onClick={() => checkInMutation.mutate(booking.id)}
                                  disabled={checkInMutation.isPending}
                                >
                                  Check In
                                </Button>
                              )}
                              {booking.status === "checked_in" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => checkOutMutation.mutate(booking.id)}
                                  disabled={checkOutMutation.isPending}
                                >
                                  Check Out
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
