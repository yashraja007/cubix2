import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRoomSchema, insertGuestSchema, insertBookingSchema, insertWhatsappCommandSchema } from "@shared/schema";

// OpenAI and Twilio setup
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";

async function parseWhatsAppCommand(message: string): Promise<any> {
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured, using fallback parsing");
    return { action: "unknown", message: message };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a hotel management assistant. Extract structured commands from WhatsApp messages.
            
Return JSON in this format:
{
  "action": "block_room|unblock_room|book_room|check_in|check_out|room_status|revenue_check|occupancy_check|unknown",
  "room": "room_number_if_mentioned",
  "guest_name": "guest_name_if_mentioned",
  "start_date": "YYYY-MM-DD_if_mentioned",
  "end_date": "YYYY-MM-DD_if_mentioned",
  "check_in_time": "HH:MM_if_mentioned",
  "check_out_time": "HH:MM_if_mentioned",
  "guest_phone": "phone_number_if_mentioned",
  "details": "any_additional_details"
}

Examples:
"Book room 102 for devansh from Dec 30 to Jan 2" -> {"action": "book_room", "room": "102", "guest_name": "devansh", "start_date": "2025-12-30", "end_date": "2026-01-02"}
"Book room 205 for John Smith tomorrow 3pm to Friday 11am" -> {"action": "book_room", "room": "205", "guest_name": "John Smith", "start_date": "2025-06-30", "end_date": "2025-07-04", "check_in_time": "15:00", "check_out_time": "11:00"}
"Check revenue today" -> {"action": "revenue_check", "details": "today"}
"What's the occupancy rate?" -> {"action": "occupancy_check"}
"Hotel occupancy this month" -> {"action": "occupancy_check", "details": "month"}
"Check in John Smith to room 108" -> {"action": "check_in", "room": "108", "guest_name": "John Smith"}
"Block room 205 from July 15 to July 17" -> {"action": "block_room", "room": "205", "start_date": "2025-07-15", "end_date": "2025-07-17"}
"Room 203 maintenance complete" -> {"action": "room_status", "room": "203", "details": "maintenance complete"}`
          },
          {
            role: "user",
            content: `Extract action details from: "${message}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return { action: "unknown", message: message };
    }
  } catch (error) {
    console.error("OpenAI parsing failed, using fallback parser:", error);
    return parseWhatsAppCommandFallback(message);
  }
}

function parseWhatsAppCommandFallback(message: string): any {
  const lowerMessage = message.toLowerCase();
  
  // Revenue check patterns
  if (lowerMessage.includes('revenue') || lowerMessage.includes('earning') || lowerMessage.includes('income')) {
    return {
      action: "revenue_check",
      details: lowerMessage.includes('today') ? "today" : "general"
    };
  }
  
  // Occupancy check patterns
  if (lowerMessage.includes('occupancy') || lowerMessage.includes('occupied') || lowerMessage.includes('full')) {
    return {
      action: "occupancy_check",
      details: lowerMessage.includes('month') ? "month" : "current"
    };
  }
  
  // Room booking patterns
  if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
    const roomMatch = message.match(/room\s+(\d+)/i);
    const nameMatch = message.match(/for\s+([a-zA-Z\s]+)/i);
    
    return {
      action: "book_room",
      room: roomMatch ? roomMatch[1] : null,
      guest_name: nameMatch ? nameMatch[1].trim() : "Guest",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      details: "Basic booking command via fallback parser"
    };
  }
  
  // Check-in patterns
  if (lowerMessage.includes('check in') || lowerMessage.includes('checkin')) {
    const roomMatch = message.match(/room\s+(\d+)/i);
    const nameMatch = message.match(/(?:check in|checkin)\s+([a-zA-Z\s]+)\s+to/i);
    
    return {
      action: "check_in",
      room: roomMatch ? roomMatch[1] : null,
      guest_name: nameMatch ? nameMatch[1].trim() : null
    };
  }
  
  // Check-out patterns  
  if (lowerMessage.includes('check out') || lowerMessage.includes('checkout')) {
    const roomMatch = message.match(/room\s+(\d+)/i);
    
    return {
      action: "check_out",
      room: roomMatch ? roomMatch[1] : null
    };
  }
  
  // Block room patterns
  if (lowerMessage.includes('block')) {
    const roomMatch = message.match(/room\s+(\d+)/i);
    
    return {
      action: "block_room",
      room: roomMatch ? roomMatch[1] : null,
      details: "maintenance"
    };
  }
  
  // Unblock room patterns
  if (lowerMessage.includes('unblock')) {
    const roomMatch = message.match(/room\s+(\d+)/i);
    
    return {
      action: "unblock_room", 
      room: roomMatch ? roomMatch[1] : null
    };
  }
  
  // Room status patterns
  if (lowerMessage.includes('status') || lowerMessage.includes('what')) {
    const roomMatch = message.match(/room\s+(\d+)/i);
    
    return {
      action: "room_status",
      room: roomMatch ? roomMatch[1] : null
    };
  }
  
  return {
    action: "unknown",
    message: message,
    fallback_used: true
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUser(1); // Get admin user
      res.json([users]); // Return as array for compatibility
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Rooms
  app.get("/api/rooms", async (req: Request, res: Response) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid room data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create room" });
      }
    }
  });

  app.put("/api/rooms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const room = await storage.updateRoom(id, updates);
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to update room" });
    }
  });

  app.post("/api/rooms/block", async (req: Request, res: Response) => {
    try {
      const { roomNumber, until, reason } = req.body;
      const room = await storage.blockRoom(roomNumber, until, reason);
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to block room" });
    }
  });

  app.post("/api/rooms/unblock", async (req: Request, res: Response) => {
    try {
      const { roomNumber } = req.body;
      const room = await storage.unblockRoom(roomNumber);
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to unblock room" });
    }
  });

  // Guests
  app.get("/api/guests", async (req: Request, res: Response) => {
    try {
      const guests = await storage.getGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guests" });
    }
  });

  app.post("/api/guests", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(validatedData);
      res.status(201).json(guest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid guest data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create guest" });
      }
    }
  });

  // Bookings
  app.get("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid booking data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create booking" });
      }
    }
  });

  app.post("/api/bookings/:id/checkin", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.checkInGuest(id);
      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to check in guest" });
    }
  });

  app.post("/api/bookings/:id/checkout", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.checkOutGuest(id);
      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to check out guest" });
    }
  });

  // WhatsApp Commands
  app.get("/api/whatsapp/commands", async (req: Request, res: Response) => {
    try {
      const commands = await storage.getWhatsappCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp commands" });
    }
  });

  // WhatsApp Webhook
  app.post("/api/whatsapp/webhook", async (req: Request, res: Response) => {
    try {
      const { Body: message, From: sender } = req.body;
      
      if (!message || !sender) {
        res.status(400).send("Missing required parameters");
        return;
      }

      console.log(`Received WhatsApp message from ${sender}: ${message}`);

      // Parse the command using OpenAI
      const parsedAction = await parseWhatsAppCommand(message);
      
      // Store the command in database
      const command = await storage.createWhatsappCommand({
        sender,
        message,
        parsedAction: JSON.stringify(parsedAction),
        status: "pending"
      });

      // Process the command
      let responseMessage = "🔍 Command received and being processed...";
      let commandStatus = "processed";

      try {
        switch (parsedAction.action) {
          case "block_room":
            if (parsedAction.room && parsedAction.end_date) {
              const room = await storage.blockRoom(
                parsedAction.room, 
                parsedAction.end_date, 
                parsedAction.details || "Blocked via WhatsApp"
              );
              if (room) {
                responseMessage = `✅ Room ${parsedAction.room} has been blocked until ${parsedAction.end_date}`;
                commandStatus = "completed";
              } else {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            } else {
              responseMessage = "❌ Please specify room number and end date";
              commandStatus = "failed";
            }
            break;

          case "unblock_room":
            if (parsedAction.room) {
              const room = await storage.unblockRoom(parsedAction.room);
              if (room) {
                responseMessage = `✅ Room ${parsedAction.room} has been unblocked`;
                commandStatus = "completed";
              } else {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            } else {
              responseMessage = "❌ Please specify room number";
              commandStatus = "failed";
            }
            break;

          case "check_in":
            if (parsedAction.room && parsedAction.guest_name) {
              // Find the room
              const room = await storage.getRoomByNumber(parsedAction.room);
              if (!room) {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
                break;
              }

              // Find active booking for this room
              const bookings = await storage.getBookings();
              const activeBooking = bookings.find(booking => 
                booking.room.number === parsedAction.room && 
                booking.status === "confirmed" &&
                booking.guest.name.toLowerCase().includes(parsedAction.guest_name.toLowerCase())
              );

              if (activeBooking) {
                // Perform check-in
                const checkedInBooking = await storage.checkInGuest(activeBooking.id);
                if (checkedInBooking) {
                  responseMessage = `✅ ${parsedAction.guest_name} has been checked into room ${parsedAction.room}\n🏨 Welcome to the hotel!`;
                  commandStatus = "completed";
                } else {
                  responseMessage = `❌ Failed to check in ${parsedAction.guest_name}`;
                  commandStatus = "failed";
                }
              } else {
                responseMessage = `❌ No confirmed booking found for ${parsedAction.guest_name} in room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            } else {
              responseMessage = "❌ Please specify both room number and guest name for check-in";
              commandStatus = "failed";
            }
            break;

          case "check_out":
            if (parsedAction.room) {
              // Find the room
              const room = await storage.getRoomByNumber(parsedAction.room);
              if (!room) {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
                break;
              }

              // Find active booking for this room
              const bookings = await storage.getBookings();
              const activeBooking = bookings.find(booking => 
                booking.room.number === parsedAction.room && 
                booking.status === "checked_in"
              );

              if (activeBooking) {
                // Perform check-out
                const checkedOutBooking = await storage.checkOutGuest(activeBooking.id);
                if (checkedOutBooking) {
                  responseMessage = `✅ Guest has been checked out from room ${parsedAction.room}\n👋 Thank you for staying with us!`;
                  commandStatus = "completed";
                } else {
                  responseMessage = `❌ Failed to check out guest from room ${parsedAction.room}`;
                  commandStatus = "failed";
                }
              } else {
                responseMessage = `❌ No checked-in guest found in room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            } else {
              responseMessage = "❌ Please specify room number for check-out";
              commandStatus = "failed";
            }
            break;

          case "room_status":
            if (parsedAction.room) {
              const room = await storage.getRoomByNumber(parsedAction.room);
              if (room) {
                responseMessage = `📋 Room ${parsedAction.room} status: ${room.status.toUpperCase()}`;
                if (parsedAction.details?.includes("maintenance complete")) {
                  await storage.updateRoom(room.id, { status: "available" });
                  responseMessage += "\n✅ Room status updated to AVAILABLE";
                }
                commandStatus = "completed";
              } else {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
              }
            }
            break;

          case "book_room":
            if (parsedAction.room && parsedAction.guest_name && parsedAction.start_date && parsedAction.end_date) {
              // Find the room
              const room = await storage.getRoomByNumber(parsedAction.room);
              if (!room) {
                responseMessage = `❌ Could not find room ${parsedAction.room}`;
                commandStatus = "failed";
                break;
              }

              // Check if room is available for the dates
              const bookings = await storage.getBookings();
              const conflictingBooking = bookings.find(booking => 
                booking.room.number === parsedAction.room &&
                booking.status !== "cancelled" &&
                booking.status !== "checked_out" &&
                (
                  (parsedAction.start_date <= booking.checkOutDate && parsedAction.end_date >= booking.checkInDate)
                )
              );

              if (conflictingBooking) {
                responseMessage = `❌ Room ${parsedAction.room} is not available from ${parsedAction.start_date} to ${parsedAction.end_date}`;
                commandStatus = "failed";
                break;
              }

              // Create or find guest
              const guests = await storage.getGuests();
              let guest = guests.find(g => g.name.toLowerCase().includes(parsedAction.guest_name.toLowerCase()));
              
              if (!guest) {
                guest = await storage.createGuest({
                  name: parsedAction.guest_name,
                  phone: parsedAction.guest_phone || null,
                  email: null,
                  idNumber: null,
                  address: null
                });
              }

              // Calculate total amount (assuming 1 night stay for simplicity)
              const nights = Math.max(1, Math.ceil((new Date(parsedAction.end_date).getTime() - new Date(parsedAction.start_date).getTime()) / (1000 * 60 * 60 * 24)));
              const totalAmount = parseFloat(room.pricePerNight) * nights;

              // Create booking
              const booking = await storage.createBooking({
                guestId: guest.id,
                roomId: room.id,
                checkInDate: parsedAction.start_date,
                checkOutDate: parsedAction.end_date,
                totalAmount: totalAmount.toString(),
                paidAmount: "0",
                status: "confirmed",
                notes: `Booked via WhatsApp${parsedAction.check_in_time ? ` - Check-in: ${parsedAction.check_in_time}` : ''}${parsedAction.check_out_time ? ` - Check-out: ${parsedAction.check_out_time}` : ''}`
              });

              responseMessage = `✅ Room ${parsedAction.room} booked for ${parsedAction.guest_name}\n📅 ${parsedAction.start_date} to ${parsedAction.end_date}\n💰 Total: ₹${totalAmount.toFixed(0)} (${nights} nights)\n🏨 Booking confirmed!`;
              commandStatus = "completed";
            } else {
              responseMessage = "❌ Please specify room number, guest name, check-in date, and check-out date";
              commandStatus = "failed";
            }
            break;

          case "revenue_check":
            try {
              const stats = await storage.getDashboardStats();
              const period = parsedAction.details?.toLowerCase() || "today";
              
              if (period.includes("today")) {
                responseMessage = `💰 Revenue Today: ₹${stats.revenueToday.toFixed(0)}\n📊 Total Rooms: ${stats.totalRooms}\n🏠 Occupied: ${stats.occupiedRooms}`;
              } else {
                responseMessage = `💰 Revenue Today: ₹${stats.revenueToday.toFixed(0)}\n📈 Performance metrics available in dashboard`;
              }
              commandStatus = "completed";
            } catch (error) {
              responseMessage = "❌ Could not retrieve revenue information";
              commandStatus = "failed";
            }
            break;

          case "occupancy_check":
            try {
              const stats = await storage.getDashboardStats();
              const occupancyRate = ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1);
              const period = parsedAction.details?.toLowerCase() || "current";
              
              responseMessage = `🏨 Current Occupancy: ${stats.occupiedRooms}/${stats.totalRooms} rooms (${occupancyRate}%)\n📅 Check-ins Today: ${stats.checkinsToday}\n📤 Check-outs Today: ${stats.checkoutsToday}`;
              commandStatus = "completed";
            } catch (error) {
              responseMessage = "❌ Could not retrieve occupancy information";
              commandStatus = "failed";
            }
            break;

          default:
            responseMessage = `🤖 Parsed command: ${JSON.stringify(parsedAction)}\n💡 Supported actions: book_room, check_in, check_out, revenue_check, occupancy_check, block_room, unblock_room, room_status`;
        }
      } catch (processError) {
        console.error("Error processing command:", processError);
        responseMessage = "❌ Error processing command";
        commandStatus = "failed";
      }

      // Update command status
      await storage.updateWhatsappCommand(command.id, {
        status: commandStatus,
        processedAt: new Date(),
        errorMessage: commandStatus === "failed" ? responseMessage : null
      });

      // Return Twilio TwiML response
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`;

      res.set('Content-Type', 'text/xml');
      res.send(twimlResponse);

    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      res.status(500).send("Internal server error");
    }
  });

  // WhatsApp Status Callback
  app.post("/api/whatsapp/status", async (req: Request, res: Response) => {
    try {
      const { MessageSid, MessageStatus, From, To, ErrorCode, ErrorMessage } = req.body;
      
      console.log("WhatsApp Status Update:", {
        messageSid: MessageSid,
        status: MessageStatus,
        from: From,
        to: To,
        error: ErrorCode ? `${ErrorCode}: ${ErrorMessage}` : null
      });

      // You can store status updates in database if needed
      // await storage.updateWhatsAppMessageStatus(MessageSid, MessageStatus);

      res.status(200).send("OK");
    } catch (error) {
      console.error("WhatsApp status callback error:", error);
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
