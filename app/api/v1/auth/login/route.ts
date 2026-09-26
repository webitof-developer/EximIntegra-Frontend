import { NextResponse } from "next/server";
import { AuthResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || "trade.officer@integra-metals.com";

    // Standard mock token matching enterprise contract
    const response: AuthResponse = {
      access_token: `mock_jwt_token_${Buffer.from(email).toString("base64")}_${Date.now()}`,
      token_type: "bearer",
      user: {
        id: "usr_ent_8849",
        email: email,
        name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Enterprise Trade Officer",
        company: "Integra Metals & Global Resources Corp",
        role: "TRADE_ADVISOR",
        tier: "ENTERPRISE",
        createdAt: "2026-01-15T09:00:00Z",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
