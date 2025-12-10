import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-6">
      <div className="text-center max-w-2xl">
        {/* Illustration */}
        <div className="flex justify-center mb-10">
          <svg
            viewBox="0 0 520 300"
            className="w-[380px] h-auto"
            aria-hidden="true"
          >
            {/* Background 403 */}
            <g opacity="0.08">
              <text
                x="60"
                y="200"
                fontSize="160"
                fontWeight="700"
                fill="#0f172a"
              >
                403
              </text>
            </g>

            {/* Door illustration */}
            <g transform="translate(190,40)">
              <rect
                x="0"
                y="30"
                width="140"
                height="180"
                rx="18"
                fill="#ffffff"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              <circle cx="70" cy="100" r="5" fill="#FB7185" />
              <circle cx="40" cy="100" r="5" fill="#60A5FA" />

              <g transform="translate(50,55)">
                <rect width="40" height="20" rx="10" fill="#F1F5F9" />
                <text
                  x="20"
                  y="14"
                  fontSize="10"
                  textAnchor="middle"
                  fill="#94a3b8"
                >
                  CLOSED
                </text>
              </g>
            </g>

            {/* Person sitting */}
            <g transform="translate(100,160)">
              <circle cx="0" cy="-25" r="14" fill="#FDE68A" />
              <rect
                x="-14"
                y="-5"
                width="28"
                height="28"
                rx="6"
                fill="#93C5FD"
              />
            </g>

            {/* Person standing */}
            <g transform="translate(350,140)">
              <circle cx="0" cy="-30" r="16" fill="#FDE68A" />
              <rect
                x="-14"
                y="-8"
                width="28"
                height="45"
                rx="8"
                fill="#FB7185"
              />
            </g>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          We’re Sorry...
        </h1>

        {/* Description */}
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          The page you&apos;re trying to access has restricted access. Please
          contact your system administrator if you believe this is an error.
        </p>

        {/* Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow transition"
          >
            Go Back
          </Link>
        </div>
      </div>
    </main>
  );
}
