"use client";

import Link from "next/link";

export default function Home() {
    return (
        <main style={{ backgroundColor: "#fff8f1", color: "#1e1b17", minHeight: "100vh", fontFamily: "sans-serif", margin: 0, padding: 0, overflowX: "hidden" }}>

            {/* NAVBAR */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                backgroundColor: "rgba(255,248,241,0.85)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
            }}>
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 32px", maxWidth: "1280px", margin: "0 auto"
                }}>
                    {/* LOGO */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                        <span style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                            VolunteerHub
                        </span>
                    </div>

                    {/* NAV LINKS */}
                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                        <a style={{ color: "#C8522A", borderBottom: "2px solid #C8522A", paddingBottom: "4px", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", textDecoration: "none" }}>
                            Home
                        </a>
                        <a style={{ color: "#58423b", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", textDecoration: "none" }}>
                            About
                        </a>
                        <a style={{ color: "#58423b", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", textDecoration: "none" }}>
                            Contact
                        </a>
                    </div>

                    {/* LOGIN */}
                    <Link href="/login">
                        <button style={{
                            padding: "8px 20px", borderRadius: "999px",
                            backgroundColor: "#C8522A", color: "white",
                            fontSize: "0.85rem", fontWeight: 700, border: "none", cursor: "pointer"
                        }}>
                            Login
                        </button>
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="sc-hero">
                <div className="sc-hero-text">
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 900, color: "#a33811", lineHeight: 1.1, margin: 0 }}>
                        Every Hour <br />
                        <span style={{ color: "#1e1b17" }}>Counts.</span>
                    </h1>
                    <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)", color: "#58423b", maxWidth: "480px", lineHeight: 1.6, margin: 0 }}>
                        A professional platform for NGOs to track volunteer history,
                        celebrate impact, and manage community records.
                    </p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <Link href="/signup">
                            <button style={{
                                padding: "14px 28px", borderRadius: "999px",
                                backgroundColor: "#C8522A", color: "white",
                                fontWeight: 700, border: "none", cursor: "pointer", fontSize: "1rem"
                            }}>
                                Start Tracking
                            </button>
                        </Link>
                        <button style={{
                            padding: "14px 28px", borderRadius: "999px",
                            backgroundColor: "#eee7df", fontWeight: 700,
                            border: "none", cursor: "pointer", fontSize: "1rem"
                        }}>
                            Learn More
                        </button>
                    </div>
                </div>

                {/* HERO IMAGE */}
                <div style={{ borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGYBF7hOjryhn_b_qY9SWAPOYG1YLQs_OpMEqni3xgL-QnDGpS0njeqLDzw5-luK-KO6KngynXhozh2123cCpH6WWrxgLAPW5Dc9Py7EtDHIIdHvt353qLxonhSLJzEOtwJSgQ6YAWr3liXFP5uN4w1__Om3ryIOkZWO983kkdJ-knyNdDw1Ah5ATTcyLRPsJ5F5-HNnZCjCzGzGbdBH6oYLVgJGqHDu8a-zZL2It2LodZE75EBZfNn9wbnYoxRyvuJZxXeX5jKAR7"
                        style={{ width: "100%", height: "420px", objectFit: "cover", display: "block" }}
                        alt="volunteers"
                    />
                </div>
            </section>

            {/* FEATURES */}
            <section style={{ backgroundColor: "#f4ede5", padding: "80px 0" }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, marginBottom: "12px" }}>
                        How We Empower NGOs
                    </h2>
                    <p style={{ color: "#58423b", marginBottom: "48px" }}>
                        Connecting passionate volunteers with meaningful causes.
                    </p>
                    <div className="sc-features-grid">
                        {[
                            { title: "Track Impact", desc: "Monitor volunteer hours and community reach in real-time." },
                            { title: "Secure Records", desc: "Keep all volunteer data safe and accessible." },
                            { title: "Easy Management", desc: "Automate tasks and focus on real impact." },
                        ].map((f) => (
                            <div key={f.title} style={{
                                backgroundColor: "#C8521A", padding: "32px 24px",
                                borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                            }}>
                                <h3 style={{ color: "white", fontWeight: 700, marginBottom: "8px", fontSize: "1.1rem" }}>{f.title}</h3>
                                <p style={{ color: "white", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PORTALS */}
            <section style={{ padding: "80px 32px", maxWidth: "1280px", margin: "0 auto" }}>
                <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, marginBottom: "48px" }}>
                    Select Your Portal
                </h2>
                <div className="sc-portals-grid">
                    {/* VOLUNTEER */}
                    <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuACxZ4mrpUN8QGt3itnP5izTcp-BQQYpYa3XXkOk-W3JON6u8xz9X5MhHEu15I1Bb0W33_eZTrtu-2Mg179gRr96Drr8vDj7ALA7lq3dEC-C1oQFZIlbdw0SRH5MTd0F6F2UZyfAwjM6LrXp97z8pJGJCTP_2W94sJsyv58SzG-WDer04Bu-xdepN1FL_HaNk6LWHMPWsH000LPnuc4hKqpXu-f20uzMu0SzcDuS8JDpcNj2cPm_psheM9XCIETMS4oRfUeFMD40HyN"
                            style={{ height: "200px", width: "100%", objectFit: "cover", display: "block" }}
                            alt="volunteer"
                        />
                        <div style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 8px 0" }}>Volunteer Portal</h3>
                            <p style={{ color: "#58423b", margin: "0 0 16px 0" }}>Track hours and explore opportunities.</p>
                            <Link href="/login">
                                <button style={{
                                    width: "100%", padding: "12px",
                                    backgroundColor: "#C8522A", color: "white",
                                    borderRadius: "999px", border: "none",
                                    cursor: "pointer", fontWeight: 600, fontSize: "1rem"
                                }}>
                                    Log In
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* ADMIN */}
                    <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJj6Ug3ZWf0q9kvXwnnCotTG2tNSHIIanLoxNEQ26b8ivovhj4JYPsy7gFywqcCs584D7N67GO40l2IFg5BhZJyJz5RPqXKs63Vk2B85lnadyv1gUgNkWF7oqUZaiqAIBzzfKF8ByrEfAirbxCqmKJzc92-tsPAt-eTskIuPZaKiySwk6rN6DMdNnaPXblWaopay1rqrrqAjg0U3jfhOftkR56o3t-l4_9Fwi8CwNA5zhaeIY6X-t3o2Bal30qTllfHLnEJilMiVuW"
                            style={{ height: "200px", width: "100%", objectFit: "cover", display: "block" }}
                            alt="admin"
                        />
                        <div style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 8px 0" }}>Admin Portal</h3>
                            <p style={{ color: "#58423b", margin: "0 0 16px 0" }}>Manage projects and volunteers.</p>
                            <Link href="/admin/login">
                                <button style={{
                                    width: "100%", padding: "12px",
                                    backgroundColor: "#a33811", color: "white",
                                    borderRadius: "999px", border: "none",
                                    cursor: "pointer", fontWeight: 600, fontSize: "1rem"
                                }}>
                                    Log in
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ backgroundColor: "#f9f3eb", padding: "40px 32px", textAlign: "center", color: "#58423b" }}>
                © 2026 VolunteerHub. All rights reserved.
            </footer>

            {/* RESPONSIVE STYLES — scoped classnames so nothing else is affected */}
            <style>{`
                .sc-hero {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 110px 32px 80px 32px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 48px;
                    align-items: center;
                }
                .sc-hero-text {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .sc-features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }
                .sc-portals-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 32px;
                }

                @media (max-width: 900px) {
                    .sc-hero {
                        grid-template-columns: 1fr !important;
                        padding-top: 90px !important;
                    }
                    .sc-features-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .sc-portals-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 600px) {
                    .sc-hero {
                        padding: 90px 16px 48px 16px !important;
                    }
                }
            `}</style>
        </main>
    );
}