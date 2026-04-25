import SignUpForm from "./SignUpForm"

export default function SignUpPage() {
  if (process.env.ALLOW_REGISTRATION === "false") {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <span className="text-4xl">✈️</span>
          <h1 className="text-2xl font-bold text-white mt-3">j3tsetr</h1>
          <p className="text-gray-500 text-sm mt-4">
            Registration is disabled on this instance.
          </p>
        </div>
      </div>
    )
  }

  return <SignUpForm />
}
