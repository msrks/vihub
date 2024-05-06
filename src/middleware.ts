import withAuth from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    console.log("middleware", req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // console.log(token);
        // return !!token;
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|trpc|_next/static|_next/image|favicon.ico).*)",
  ],
};
