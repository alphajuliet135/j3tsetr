import SignInForm from "./SignInForm"
import { prisma } from "@/lib/db"

export default async function SignInPage() {
  const setting = await prisma.appSetting.findUnique({ where: { key: "allowRegistration" } })
  const registrationEnabled = setting ? setting.value === "true" : process.env.ALLOW_REGISTRATION !== "false"
  return <SignInForm registrationEnabled={registrationEnabled} />
}
