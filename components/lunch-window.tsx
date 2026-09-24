import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLunchBreakNow } from "@/lib/lunch";

export async function LunchWindow() {
  const path = (await headers()).get("x-pathname") ?? "/";
  const active = await isLunchBreakNow();

  if (active && path !== "/lunch") {
    redirect("/lunch");
  }

  if (!active && path === "/lunch") {
    redirect("/");
  }

  return null;
}
