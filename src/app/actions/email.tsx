import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface InviteUserEmailProps {
  invitedByUsername?: string;
  invitedByEmail?: string;
  workspaceName?: string;
  inviteLink?: string;
}

export const InviteUserEmail = ({
  invitedByUsername,
  invitedByEmail,
  workspaceName,
  inviteLink,
}: InviteUserEmailProps) => {
  const previewText = `Join ${workspaceName} on VIHub`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src="https://vihub.msrks.dev/icon.png"
                width="40"
                alt="VIHub"
                className="mx-auto my-0"
              />
            </Section>
            <Text className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal">
              Join <strong>{workspaceName}</strong> on <strong>VIHUB</strong>
            </Text>
            <Text className="text-[14px] leading-[24px]">Hello,</Text>
            <Text className="text-[14px] leading-[24px]">
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-orange-500 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) has invited you to the new workspace.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-orange-500 px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={inviteLink}
              >
                Join the workspace
              </Button>
            </Section>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you were not expecting this invitation, you can ignore this
              email. If you are concerned about your account&apos;s safety,
              please reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

InviteUserEmail.PreviewProps = {
  invitedByUsername: "Alan",
  invitedByEmail: "alan.turing@example.com",
  workspaceName: "Enigma",
  inviteLink: "https://vihub.msrks.dev/",
} as InviteUserEmailProps;

export default InviteUserEmail;
