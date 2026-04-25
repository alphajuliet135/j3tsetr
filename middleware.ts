import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/((?!j/|auth/|api/|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons|apple-touch-icon).*)",
  ],
}
