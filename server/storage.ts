import { 
  users, rooms, guests, bookings, whatsappCommands,
  type User, type InsertUser,
  type Room, type InsertRoom,
  type Guest, type InsertGuest,
  type Booking, type InsertBooking, type BookingWithGuest,
  type WhatsappCommand, type InsertWhatsappCommand,
  type RoomWithCurrentBooking
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Rooms
  getRooms(): Promise<RoomWithCurrentBooking[]>;
  getRoom(id: number): Promise<Room | undefined>;
  getRoomByNumber(number: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, updates: Partial<Room>): Promise<Room | undefined>;
  blockRoom(roomNumber: string, until: string, reason: string): Promise<Room | undefined>;
  unblockRoom(roomNumber: string): Promise<Room | undefined>;

  // Guests
  getGuests(): Promise<Guest[]>;
  getGuest(id: number): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, updates: Partial<Guest>): Promise<Guest | undefined>;

  // Bookings
  getBookings(): Promise<BookingWithGuest[]>;
  getBooking(id: number): Promise<BookingWithGuest | undefined>;
  getBookingsByRoom(roomId: number): Promise<BookingWithGuest[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined>;
  checkInGuest(bookingId: number): Promise<Booking | undefined>;
  checkOutGuest(bookingId: number): Promise<Booking | undefined>;

  // WhatsApp Commands
  getWhatsappCommands(): Promise<WhatsappCommand[]>;
  createWhatsappCommand(command: InsertWhatsappCommand): Promise<WhatsappCommand>;
  updateWhatsappCommand(id: number, updates: Partial<WhatsappCommand>): Promise<WhatsappCommand | undefined>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalRooms: number;
    occupiedRooms: number;
    checkinsToday: number;
    revenueToday: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rooms: Map<number, Room>;
  private guests: Map<number, Guest>;
  private bookings: Map<number, Booking>;
  private whatsappCommands: Map<number, WhatsappCommand>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.guests = new Map();
    this.bookings = new Map();
    this.whatsappCommands = new Map();
    this.currentId = {
      users: 1,
      rooms: 1,
      guests: 1,
      bookings: 1,
      whatsappCommands: 1,
    };

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentId.users++,
      username: "admin",
      password: "admin123", // In production, this should be hashed
      role: "admin",
      name: "John Doe",
      email: "admin@hotel.com",
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample rooms
    const sampleRooms: Room[] = [
      { id: this.currentId.rooms++, number: "101", type: "standard", status: "occupied", floor: 1, maxOccupancy: 2, pricePerNight: "120.00", amenities: ["wifi", "tv"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "102", type: "standard", status: "available", floor: 1, maxOccupancy: 2, pricePerNight: "120.00", amenities: ["wifi", "tv"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "103", type: "deluxe", status: "maintenance", floor: 1, maxOccupancy: 3, pricePerNight: "180.00", amenities: ["wifi", "tv", "minibar"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "104", type: "deluxe", status: "occupied", floor: 1, maxOccupancy: 3, pricePerNight: "180.00", amenities: ["wifi", "tv", "minibar"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "105", type: "suite", status: "blocked", floor: 1, maxOccupancy: 4, pricePerNight: "300.00", amenities: ["wifi", "tv", "minibar", "jacuzzi"], blockedUntil: "2025-07-17", blockReason: "Renovation" },
      { id: this.currentId.rooms++, number: "106", type: "standard", status: "available", floor: 1, maxOccupancy: 2, pricePerNight: "120.00", amenities: ["wifi", "tv"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "201", type: "deluxe", status: "occupied", floor: 2, maxOccupancy: 3, pricePerNight: "180.00", amenities: ["wifi", "tv", "minibar"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "202", type: "deluxe", status: "occupied", floor: 2, maxOccupancy: 3, pricePerNight: "180.00", amenities: ["wifi", "tv", "minibar"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "203", type: "standard", status: "available", floor: 2, maxOccupancy: 2, pricePerNight: "120.00", amenities: ["wifi", "tv"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "204", type: "suite", status: "occupied", floor: 2, maxOccupancy: 4, pricePerNight: "300.00", amenities: ["wifi", "tv", "minibar", "jacuzzi"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "205", type: "standard", status: "available", floor: 2, maxOccupancy: 2, pricePerNight: "120.00", amenities: ["wifi", "tv"], blockedUntil: null, blockReason: null },
      { id: this.currentId.rooms++, number: "206", type: "deluxe", status: "occupied", floor: 2, maxOccupancy: 3, pricePerNight: "180.00", amenities: ["wifi", "tv", "minibar"], blockedUntil: null, blockReason: null },
    ];

    sampleRooms.forEach(room => this.rooms.set(room.id, room));

    // Create sample guests
    const sampleGuests: Guest[] = [
      { id: this.currentId.guests++, name: "Arjun Sharma", email: "arjun.sharma@email.com", phone: "+919876543210", idNumber: "AADH001", address: "123 MG Road, Mumbai", createdAt: new Date() },
      { id: this.currentId.guests++, name: "Priya Patel", email: "priya.patel@email.com", phone: "+919876543211", idNumber: "AADH002", address: "456 Brigade Road, Bangalore", createdAt: new Date() },
      { id: this.currentId.guests++, name: "Rajesh Kumar", email: "rajesh.kumar@email.com", phone: "+919876543212", idNumber: "AADH003", address: "789 CP, New Delhi", createdAt: new Date() },
    ];

    sampleGuests.forEach(guest => this.guests.set(guest.id, guest));

    // Create sample bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const sampleBookings: Booking[] = [
      {
        id: this.currentId.bookings++,
        guestId: 1,
        roomId: 10, // Room 204
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: dayAfter.toISOString().split('T')[0],
        actualCheckIn: today,
        actualCheckOut: null,
        status: "checked_in",
        totalAmount: "600.00",
        paidAmount: "600.00",
        notes: null,
        createdAt: new Date(),
      },
      {
        id: this.currentId.bookings++,
        guestId: 2,
        roomId: 2, // Room 102
        checkInDate: tomorrow.toISOString().split('T')[0],
        checkOutDate: dayAfter.toISOString().split('T')[0],
        actualCheckIn: null,
        actualCheckOut: null,
        status: "confirmed",
        totalAmount: "120.00",
        paidAmount: "0.00",
        notes: null,
        createdAt: new Date(),
      },
    ];

    sampleBookings.forEach(booking => this.bookings.set(booking.id, booking));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Room methods
  async getRooms(): Promise<RoomWithCurrentBooking[]> {
    const roomsArray = Array.from(this.rooms.values());
    const today = new Date().toISOString().split('T')[0];
    
    return roomsArray.map(room => {
      const currentBooking = Array.from(this.bookings.values()).find(
        booking => booking.roomId === room.id && 
        booking.checkInDate <= today && 
        booking.checkOutDate >= today &&
        (booking.status === "checked_in" || booking.status === "confirmed")
      );

      if (currentBooking) {
        const guest = this.guests.get(currentBooking.guestId);
        return {
          ...room,
          currentBooking: guest ? { ...currentBooking, guest, room } : undefined
        };
      }

      return room;
    });
  }

  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByNumber(number: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.number === number);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.currentId.rooms++;
    const room: Room = { ...insertRoom, id };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: number, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async blockRoom(roomNumber: string, until: string, reason: string): Promise<Room | undefined> {
    const room = await this.getRoomByNumber(roomNumber);
    if (!room) return undefined;

    return this.updateRoom(room.id, {
      status: "blocked",
      blockedUntil: until,
      blockReason: reason
    });
  }

  async unblockRoom(roomNumber: string): Promise<Room | undefined> {
    const room = await this.getRoomByNumber(roomNumber);
    if (!room) return undefined;

    return this.updateRoom(room.id, {
      status: "available",
      blockedUntil: null,
      blockReason: null
    });
  }

  // Guest methods
  async getGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.currentId.guests++;
    const guest: Guest = { ...insertGuest, id, createdAt: new Date() };
    this.guests.set(id, guest);
    return guest;
  }

  async updateGuest(id: number, updates: Partial<Guest>): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest) return undefined;
    
    const updatedGuest = { ...guest, ...updates };
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  // Booking methods
  async getBookings(): Promise<BookingWithGuest[]> {
    return Array.from(this.bookings.values()).map(booking => {
      const guest = this.guests.get(booking.guestId)!;
      const room = this.rooms.get(booking.roomId)!;
      return { ...booking, guest, room };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBooking(id: number): Promise<BookingWithGuest | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const guest = this.guests.get(booking.guestId);
    const room = this.rooms.get(booking.roomId);
    if (!guest || !room) return undefined;
    
    return { ...booking, guest, room };
  }

  async getBookingsByRoom(roomId: number): Promise<BookingWithGuest[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.roomId === roomId)
      .map(booking => {
        const guest = this.guests.get(booking.guestId)!;
        const room = this.rooms.get(booking.roomId)!;
        return { ...booking, guest, room };
      });
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId.bookings++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date(),
      actualCheckIn: null,
      actualCheckOut: null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async checkInGuest(bookingId: number): Promise<Booking | undefined> {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    const updatedBooking = {
      ...booking,
      status: "checked_in" as const,
      actualCheckIn: new Date()
    };
    
    this.bookings.set(bookingId, updatedBooking);
    
    // Update room status
    await this.updateRoom(booking.roomId, { status: "occupied" });
    
    return updatedBooking;
  }

  async checkOutGuest(bookingId: number): Promise<Booking | undefined> {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    const updatedBooking = {
      ...booking,
      status: "checked_out" as const,
      actualCheckOut: new Date()
    };
    
    this.bookings.set(bookingId, updatedBooking);
    
    // Update room status
    await this.updateRoom(booking.roomId, { status: "available" });
    
    return updatedBooking;
  }

  // WhatsApp Commands
  async getWhatsappCommands(): Promise<WhatsappCommand[]> {
    return Array.from(this.whatsappCommands.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createWhatsappCommand(insertCommand: InsertWhatsappCommand): Promise<WhatsappCommand> {
    const id = this.currentId.whatsappCommands++;
    const command: WhatsappCommand = { 
      ...insertCommand, 
      id, 
      createdAt: new Date(),
      processedAt: null
    };
    this.whatsappCommands.set(id, command);
    return command;
  }

  async updateWhatsappCommand(id: number, updates: Partial<WhatsappCommand>): Promise<WhatsappCommand | undefined> {
    const command = this.whatsappCommands.get(id);
    if (!command) return undefined;
    
    const updatedCommand = { ...command, ...updates };
    this.whatsappCommands.set(id, updatedCommand);
    return updatedCommand;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalRooms: number;
    occupiedRooms: number;
    checkinsToday: number;
    checkoutsToday: number;
    revenueToday: number;
  }> {
    const rooms = Array.from(this.rooms.values());
    const bookings = Array.from(this.bookings.values());
    const today = new Date().toISOString().split('T')[0];

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(room => room.status === "occupied").length;
    
    const checkinsToday = bookings.filter(booking => 
      booking.checkInDate === today && 
      (booking.status === "confirmed" || booking.status === "checked_in")
    ).length;

    const revenueToday = bookings
      .filter(booking => booking.actualCheckIn && 
        booking.actualCheckIn.toISOString().split('T')[0] === today)
      .reduce((total, booking) => total + parseFloat(booking.paidAmount || "0"), 0);

    const checkoutsToday = bookings
      .filter(booking => booking.actualCheckOut && 
        booking.actualCheckOut.toISOString().split('T')[0] === today)
      .length;

    return {
      totalRooms,
      occupiedRooms,
      checkinsToday,
      checkoutsToday,
      revenueToday
    };
  }
}

export const storage = new MemStorage();
