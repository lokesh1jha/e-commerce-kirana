import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createProductSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createProductSchema.extend({ categoryId: z.string().optional() });
    const data = (parsed as any).parse(body);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        images: data.images,
        meta: data.meta,
        categoryId: data.categoryId ?? null,
        variants: {
          create: data.variants.map((v: any) => ({
            unit: v.unit,
            amount: v.amount,
            price: v.price,
            stock: v.stock,
            sku: v.sku ?? null,
          })),
        },
      },
      include: { variants: true, category: true },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Invalid data" }, { status: 400 });
  }
}