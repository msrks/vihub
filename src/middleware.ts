import withAuth from "next-auth/middleware";

export default withAuth(
  // async function middleware(req) {
  //   // console.log("middleware", req.nextauth.token);
  //   const session = await getSession({
  //     req: {
  //       ...req,
  //       headers: {
  //         ...Object.fromEntries(req.headers),
  //       },
  //     },
  //   });
  //   console.log("middleware", session?.user);
  //   return NextResponse.next();
  // },
  {
    callbacks: {
      authorized: async ({ token }) => {
        // const session = await getSession({
        //   req: {
        //     ...req,
        //     headers: {
        //       ...Object.fromEntries(req.headers),
        //     },
        //   },
        // });
        // return !!session?.user;
        // console.log(token);
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
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
     * - root path (/)
     */
    "/((?!api|opengraph-image|trpc|_next/static|_next/image|favicon.ico|$).*)",
  ],
};
