import SignInForm from "./SignInForm"

export default function SignInPage() {
  const registrationEnabled = process.env.ALLOW_REGISTRATION !== "false"
  return <SignInForm registrationEnabled={registrationEnabled} />
}
