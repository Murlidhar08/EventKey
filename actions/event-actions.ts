"use server";

import { prisma } from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getUserSession } from "@/lib/auth/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { getCurrentUser } from "./user.actions";

async function isUserAdmin() {
  const session = await getUserSession();
  return !!session && (session.user.role === UserRole.admin || (session.user as any).role === "admin");
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  capacity?: number;
}

export interface UpdateEventInput {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  capacity?: number;
}

export interface CreatePassInput {
  eventId: string;
  holderName: string;
  holderEmail: string;
}

export interface ScanResult {
  success: boolean;
  status: "APPROVED" | "DENIED";
  message: string;
  rejectionReason?: string;
  pass?: {
    id: string;
    token: string;
    holderName: string;
    holderEmail: string;
    status: string;
  };
  checkIn?: {
    id: string;
    scannedAt: Date;
  };
}

/**
 * Creates a new event.
 */
export async function createEventAction(input: CreateEventInput) {
  try {
    if (!(await isUserAdmin())) {
      return { success: false, error: "Unauthorized: Admin privileges required" };
    }
    const event = await prisma.event.create({
      data: {
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        capacity: input.capacity ? Number(input.capacity) : 100,
      },
    });

    revalidatePath("/events");
    return { success: true, event };
  } catch (error: any) {
    console.error("createEventAction error:", error);
    return { success: false, error: error?.message || "Failed to create event" };
  }
}

/**
 * Updates an existing event.
 */
export async function updateEventAction(input: UpdateEventInput) {
  try {
    if (!(await isUserAdmin())) {
      return { success: false, error: "Unauthorized: Admin privileges required" };
    }
    const event = await prisma.event.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        capacity: input.capacity ? Number(input.capacity) : 100,
      },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${input.id}`);
    return { success: true, event };
  } catch (error: any) {
    console.error("updateEventAction error:", error);
    return { success: false, error: error?.message || "Failed to update event" };
  }
}

/**
 * Gets all events with summary counters.
 */
export async function getEventsAction() {
  try {
    if (!(await isUserAdmin())) {
      return { success: false, events: [] };
    }
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { passes: true, checkIns: true },
        },
      },
    });
    return { success: true, events };
  } catch (error: any) {
    console.error("getEventsAction error:", error);
    return { success: false, events: [] };
  }
}

/**
 * Gets event details by ID with pass & check-in analytics.
 */
export async function getEventDetailsAction(eventId: string) {
  try {
    if (!(await isUserAdmin())) {
      return { success: false, error: "Unauthorized: Admin privileges required" };
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        passes: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        checkIns: {
          orderBy: { scannedAt: "desc" },
          take: 50,
          include: { pass: true },
        },
        _count: {
          select: { passes: true, checkIns: true },
        },
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    const approvedCount = await prisma.checkIn.count({
      where: { eventId, status: "APPROVED" },
    });

    const deniedCount = await prisma.checkIn.count({
      where: { eventId, status: "DENIED" },
    });

    const activePassesCount = await prisma.pass.count({
      where: { eventId, status: "ACTIVE" },
    });

    const usedPassesCount = await prisma.pass.count({
      where: { eventId, status: "USED" },
    });

    return {
      success: true,
      event,
      stats: {
        approvedCount,
        deniedCount,
        activePassesCount,
        usedPassesCount,
      },
    };
  } catch (error: any) {
    console.error("getEventDetailsAction error:", error);
    return { success: false, error: error?.message || "Failed to fetch event details" };
  }
}

/**
 * Generates a new pass with a random unique token for an event.
 */
export async function createPassAction(input: CreatePassInput) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.admin) {
      return { success: false, error: "Unauthorized: Admin privileges required" };
    }
    // Generate secure random 16-char token: ek_live_xxxxx
    const randomHex = crypto.randomBytes(12).toString("hex");
    const token = `ek_${randomHex}`;

    const pass = await prisma.pass.create({
      data: {
        eventId: input.eventId,
        token,
        holderName: input.holderName,
        holderEmail: input.holderEmail,
        status: "ACTIVE",
        createdBy: user.id,
      },
    });

    revalidatePath(`/events/${input.eventId}/passes`);
    return { success: true, pass };
  } catch (error: any) {
    console.error("createPassAction error:", error);
    return { success: false, error: error?.message || "Failed to create pass" };
  }
}

/**
 * Bulk generate sample passes for testing.
 */
export async function generateBulkPassesAction(eventId: string, count: number = 5) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.admin) {
      return { success: false, error: "Unauthorized: Admin privileges required" };
    }

    const passes = [];
    for (let i = 0; i < count; i++) {
      const randomHex = crypto.randomBytes(10).toString("hex");
      const token = `ek_${randomHex}`;
      const num = Math.floor(Math.random() * 900) + 100;
      const pass = await prisma.pass.create({
        data: {
          eventId,
          token,
          holderName: `Attendee #${num}`,
          holderEmail: `attendee${num}@example.com`,
          status: "ACTIVE",
          createdBy: user.id,
        },
      });
      passes.push(pass);
    }

    revalidatePath(`/events/${eventId}/passes`);
    return { success: true, count: passes.length };
  } catch (error: any) {
    console.error("generateBulkPassesAction error:", error);
    return { success: false, error: error?.message || "Failed to generate passes" };
  }
}

/**
 * Atomic QR Code validation action.
 * Evaluates token state atomically and records check-in log.
 */
export async function validatePassTokenAction(eventId: string, token: string, scannedBy: string = "Gate Scanner"): Promise<ScanResult> {
  if (!(await isUserAdmin())) {
    return {
      success: false,
      status: "DENIED",
      message: "Unauthorized: Admin privileges required",
      rejectionReason: "Admin role required",
    };
  }

  const cleanToken = token.trim();
  if (!cleanToken) {
    return {
      success: false,
      status: "DENIED",
      message: "Empty token provided",
      rejectionReason: "Invalid empty token",
    };
  }

  try {
    // Find pass
    const pass = await prisma.pass.findUnique({
      where: { token: cleanToken },
    });

    // Case 1: Pass does not exist
    if (!pass || pass.eventId !== eventId) {
      const checkIn = await prisma.checkIn.create({
        data: {
          eventId,
          scannedToken: cleanToken,
          status: "DENIED",
          rejectionReason: !pass ? "Pass token not found" : "Pass belongs to different event",
          scannedBy,
        },
      });

      return {
        success: false,
        status: "DENIED",
        message: !pass ? "Invalid Pass Token: Not Found" : "Pass belongs to another event",
        rejectionReason: !pass ? "Token Not Found" : "Event Mismatch",
        checkIn: { id: checkIn.id, scannedAt: checkIn.scannedAt },
      };
    }

    // Case 2: Pass already USED
    if (pass.status === "USED") {
      const checkIn = await prisma.checkIn.create({
        data: {
          eventId,
          passId: pass.id,
          scannedToken: cleanToken,
          status: "DENIED",
          rejectionReason: "Pass has already been used",
          scannedBy,
        },
      });

      return {
        success: false,
        status: "DENIED",
        message: "Entry Denied: Pass Already Used",
        rejectionReason: "Double Scan / Already Used",
        pass: {
          id: pass.id,
          token: pass.token,
          holderName: pass.holderName,
          holderEmail: pass.holderEmail,
          status: pass.status,
        },
        checkIn: { id: checkIn.id, scannedAt: checkIn.scannedAt },
      };
    }

    // Case 3: Pass EXPIRED or CANCELLED
    if (pass.status !== "ACTIVE") {
      const checkIn = await prisma.checkIn.create({
        data: {
          eventId,
          passId: pass.id,
          scannedToken: cleanToken,
          status: "DENIED",
          rejectionReason: `Pass is ${pass.status.toLowerCase()}`,
          scannedBy,
        },
      });

      return {
        success: false,
        status: "DENIED",
        message: `Entry Denied: Pass is ${pass.status}`,
        rejectionReason: `Status: ${pass.status}`,
        pass: {
          id: pass.id,
          token: pass.token,
          holderName: pass.holderName,
          holderEmail: pass.holderEmail,
          status: pass.status,
        },
        checkIn: { id: checkIn.id, scannedAt: checkIn.scannedAt },
      };
    }

    // Case 4: ACTIVE -> ATOMIC TRANSACTION to APPROVED & mark USED
    const [updatedPass, checkIn] = await prisma.$transaction([
      prisma.pass.update({
        where: { id: pass.id },
        data: { status: "USED" },
      }),
      prisma.checkIn.create({
        data: {
          eventId,
          passId: pass.id,
          scannedToken: cleanToken,
          status: "APPROVED",
          scannedBy,
        },
      }),
    ]);

    revalidatePath(`/events/${eventId}/scanner`);
    revalidatePath(`/events/${eventId}/check-ins`);
    revalidatePath(`/p/${cleanToken}`);

    return {
      success: true,
      status: "APPROVED",
      message: `Access Approved! Welcome, ${updatedPass.holderName}`,
      pass: {
        id: updatedPass.id,
        token: updatedPass.token,
        holderName: updatedPass.holderName,
        holderEmail: updatedPass.holderEmail,
        status: updatedPass.status,
      },
      checkIn: { id: checkIn.id, scannedAt: checkIn.scannedAt },
    };
  } catch (error: any) {
    console.error("validatePassTokenAction error:", error);
    return {
      success: false,
      status: "DENIED",
      message: "Server validation error",
      rejectionReason: error?.message || "Internal server error",
    };
  }
}

/**
 * Gets public pass details by token.
 */
export async function getPassByTokenAction(token: string) {
  try {
    const pass = await prisma.pass.findUnique({
      where: { token },
      include: {
        event: true,
      },
    });

    if (!pass) {
      return { success: false, error: "Pass not found" };
    }

    return { success: true, pass };
  } catch (error: any) {
    console.error("getPassByTokenAction error:", error);
    return { success: false, error: error?.message || "Failed to fetch pass" };
  }
}
