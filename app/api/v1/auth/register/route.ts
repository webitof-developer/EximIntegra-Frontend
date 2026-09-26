import { NextResponse } from "next/server";
import { AuthResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || "user@example.com";
    const name = body.name || "Trade User";
    const company = body.company || "Trade Enterprise Ltd";
    const role = body.role || "IMPORTER";

    const response: AuthResponse = {
      access_token: `mock_jwt_token_${Buffer.from(email).toString("base64")}_${Date.now()}`,
      token_type: "bearer",
      user: {
        id: `usr_${Date.now().toString().slice(-6)}`,
        email: email,
        name: name,
        company: company,
        role: role,
        tier: "PROFESSIONAL",
        createdAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid registration payload" },
      { status: 400 }
    );
  }
}
