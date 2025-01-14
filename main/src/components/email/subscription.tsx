import * as React from "react";

import { LibraryIcon } from "lucide-react";

interface SubscriptionTemplateProps {
  email: string;
}

const IconWrapper: React.FC = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-[#B45F06] to-[#783F04] rounded-2xl blur-2xl opacity-70" />
    <div className="relative w-32 h-32 bg-gradient-to-br from-[#B45F06] to-[#783F04] rounded-2xl p-1 hover:rotate-0 transition-transform duration-500">
      <div className="w-full h-full bg-[#ffffff]/95 rounded-2xl flex items-center justify-center">
        <LibraryIcon className="w-24 h-24 text-white" />
      </div>
    </div>
  </div>
);


export const SubscriptionTemplate: React.FC<Readonly<SubscriptionTemplateProps>> = ({
  email,
}) => (
  <div
    style={{
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: "#1C0F0A",
      margin: "0",
      padding: "48px 0",
      width: "100%",
    }}
  >
    <table
      cellPadding="0"
      cellSpacing="0"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
        backgroundColor: "rgba(28, 15, 10, 0.95)",
        borderRadius: "8px",
        border: "1px solid rgba(120, 63, 4, 0.3)",
      }}
    >
      <tr>
        <td
          style={{
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          {/* Reusable Icon Wrapper */}
          <IconWrapper />

          <h1
              style={{
                color: "#F8F2EB",
                fontSize: "24px",
                fontWeight: "600",
                margin: "16px 0",
                lineHeight: "1.4",
              }}
            >
              Welcome, <span style={{ color: "#B45F06" }}>{email}</span>!
            </h1>

            <p
              style={{
                color: "rgba(248, 242, 235, 0.8)",
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "0 0 24px 0",
              }}
            >
              Thanks for joining the waitlist! As a member, you&apos;ll get early access to explore our blockchain-powered library platform and enjoy all the exclusive features we’re offering. Stay tuned for updates!
            </p>

          <div>
            <a
              href="https://x.com/library_protoco"
              style={{
                backgroundColor: "#B45F06",
                color: "#F8F2EB",
                padding: "12px 24px",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: "500",
                display: "inline-block",
                textAlign: "center",
                fontSize: "16px",
              }}
            >
              X Updates
            </a>
          </div>

          <div
            style={{
              marginTop: "40px",
              padding: "20px 0 0",
              borderTop: "1px solid rgba(120, 63, 4, 0.3)",
              color: "rgba(248, 242, 235, 0.6)",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              © 2025 Library Protocol. All rights reserved.
            </p>
            <p style={{ margin: "0" }}>
              If you didn&apos;t sign up for this newsletter, you can safely ignore
              this email.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </div>
);
