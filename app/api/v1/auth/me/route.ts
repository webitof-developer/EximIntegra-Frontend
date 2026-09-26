import { NextResponse } from "next/server";
import { UserProfile } from "@/lib/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized access" },
      { status: 401 }
    );
  }

  const user: UserProfile = {
    id: "usr_ent_8849",
    email: "trade.officer@integra-metals.com",
    name: "Arjun Verma",
    company: "Integra Metals & Global Resources Corp",
    role: "TRADE_ADVISOR",
    tier: "ENTERPRISE",
    createdAt: "2026-01-15T09:00:00Z",
  };

  return NextResponse.json(user);
}
