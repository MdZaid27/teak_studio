import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getPatronAddresses,
  createPatronAddress,
  updatePatronAddress,
  deletePatronAddress,
} from "@/lib/patron";
import { verifyPatronAccess } from "@/lib/auth";

const addressSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  floor_building: z.string().min(2, "Floor and building details are required"),
  area_street: z.string().min(2, "Area and street details are required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Pincode must be exactly 6 digits"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional().default("India"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .pipe(
      z
        .string()
        .regex(/^[6-9]\d{9}$/, "Must be a 10-digit mobile number starting with 6, 7, 8, or 9")
    ),
  save_as: z.enum(["Home", "Work", "Others"]).default("Home"),
  is_default: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const phone = searchParams.get("phone") || undefined;

    if (!userId && !phone) {
      return NextResponse.json({ success: false, error: "userId or phone is required" }, { status: 400 });
    }

    const auth = await verifyPatronAccess({ userId: userId || undefined, phone });
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const addresses = await getPatronAddresses(userId, phone);
    return NextResponse.json({ success: true, addresses }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch addresses";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = addressSchema.parse(body);

    const auth = await verifyPatronAccess({ userId: validated.userId, phone: validated.phone });
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const address = await createPatronAddress(validated.userId, {
      floor_building: validated.floor_building,
      area_street: validated.area_street,
      pincode: validated.pincode,
      city: validated.city,
      state: validated.state,
      country: validated.country,
      first_name: validated.first_name,
      last_name: validated.last_name,
      email: validated.email || undefined,
      phone: validated.phone,
      save_as: validated.save_as,
      is_default: validated.is_default,
    });

    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to create address";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, addressId, ...updates } = body;

    if (!userId || !addressId) {
      return NextResponse.json({ success: false, error: "userId and addressId are required" }, { status: 400 });
    }

    const auth = await verifyPatronAccess({ userId });
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const updated = await updatePatronAddress(userId, addressId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, address: updated }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update address";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const addressId = searchParams.get("addressId");

    if (!userId || !addressId) {
      return NextResponse.json({ success: false, error: "userId and addressId are required" }, { status: 400 });
    }

    const auth = await verifyPatronAccess({ userId });
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await deletePatronAddress(userId, addressId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete address";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
