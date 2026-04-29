export default function Head() {
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "FFYHpX2TkaGJnZY8r9TrkpJ8hUwK4eNVIsZYJCW-aEk";

  return (
    <>
      <meta name="google-site-verification" content={verification} />
    </>
  );
}
