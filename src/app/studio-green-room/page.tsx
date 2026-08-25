import { redirect } from "next/navigation";

export default function LegacyAdminPinPage() {
  redirect("/admin/login");
}
