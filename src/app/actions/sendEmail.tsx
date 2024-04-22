"use server";

import { Resend } from "resend";
import InviteUserEmail from "./email";
import { getServerAuthSession } from "@/server/auth";

export async function sendInviteEmail(
  email: string,
  wsId: string,
  wsName: string,
) {
  const resend = new Resend(process.env.RESEND_SECRET);
  const session = await getServerAuthSession();

  return await resend.emails.send({
    from: "VIHub <vihub@msrks.dev>",
    to: email,
    subject: `Invite to ${wsName}`,
    // html: `<p>Email: ${email}</p><button>Accept</button>`,
    react: (
      <InviteUserEmail
        invitedByUsername={session?.user.name ?? ""}
        invitedByEmail={session?.user.email ?? ""}
        workspaceName={wsName}
        inviteLink={`https://vihub.msrks.dev/api/join-workspace?wsId=${wsId}&secretKey=${process.env.VIHUB_SECRET_KEY}`}
      />
    ),
  });
}
