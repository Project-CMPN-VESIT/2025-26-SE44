"use client";

import Link from "next/link";

export default function Home() {
    return (
        <main className="bg-[#fff8f1] text-[#1e1b17] min-h-screen font-sans">

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-[#fff8f1]/80 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">

                    {/* LOGO */}
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="VolunteerHub Logo" style={{ height: "90px" }} />
                        <span className="text-2xl font-bold tracking-tight">
                            VolunteerHub
                        </span>
                    </div>

                    {/* NAV LINKS */}
                    <div className="hidden md:flex items-center gap-8">
                        <a className="text-[#C8522A] border-b-2 border-[#C8522A] pb-1 text-sm font-bold uppercase cursor-pointer">
                            Home
                        </a>
                        <a className="text-[#58423b] hover:text-[#C8522A] text-sm font-bold uppercase cursor-pointer">
                            About
                        </a>
                        <a className="text-[#58423b] hover:text-[#C8522A] text-sm font-bold uppercase cursor-pointer">
                            Contact
                        </a>
                    </div>

                    {/* LOGIN */}
                    <Link href="/login">
                        <button className="px-6 py-2 rounded-full bg-[#C8522A] text-white text-sm font-bold">
                            Login
                        </button>
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="max-w-7xl mx-auto px-8 pt-32 pb-20 grid lg:grid-cols-2 gap-16 items-center">

                <div className="space-y-8">
                    <h1 className="text-6xl lg:text-7xl font-extrabold text-[#a33811] leading-tight">
                        Every Hour <br />
                        <span className="text-[#1e1b17]">Counts.</span>
                    </h1>

                    <p className="text-xl text-[#58423b] max-w-lg">
                        A professional platform for NGOs to track volunteer history,
                        celebrate impact, and manage community records.
                    </p>

                    <div className="flex gap-4">
                        <Link href="/signup">
                            <button className="px-8 py-4 rounded-full bg-[#C8522A] text-white font-bold shadow hover:scale-105 transition">
                                Start Tracking
                            </button>
                        </Link>

                        <button className="px-8 py-4 rounded-full bg-[#eee7df] font-bold hover:bg-[#e8e1da]">
                            Learn More
                        </button>
                    </div>
                </div>

                {/* HERO IMAGE */}
                <div className="rounded-3xl overflow-hidden shadow-lg">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGYBF7hOjryhn_b_qY9SWAPOYG1YLQs_OpMEqni3xgL-QnDGpS0njeqLDzw5-luK-KO6KngynXhozh2123cCpH6WWrxgLAPW5Dc9Py7EtDHIIdHvt353qLxonhSLJzEOtwJSgQ6YAWr3liXFP5uN4w1__Om3ryIOkZWO983kkdJ-knyNdDw1Ah5ATTcyLRPsJ5F5-HNnZCjCzGzGbdBH6oYLVgJGqHDu8a-zZL2It2LodZE75EBZfNn9wbnYoxRyvuJZxXeX5jKAR7"
                        className="w-full h-[450px] object-cover"
                        alt="volunteers"
                    />
                </div>
            </section>

            {/* FEATURES */}
            <section className="bg-[#f4ede5] py-24">
                <div className="max-w-7xl mx-auto px-8 text-center">

                    <h2 className="text-4xl font-bold mb-4">
                        How We Empower NGOs
                    </h2>
                    <p className="text-[#58423b] mb-16">
                        Connecting passionate volunteers with meaningful causes.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">

                        <div className="bg-[#C8521A] p-8 rounded-2xl shadow">
                            <h3 className="text-white font-bold mb-2">Track Impact</h3>
                            <p className="text-white">
                                Monitor volunteer hours and community reach in real-time.
                            </p>
                        </div>

                        <div className="bg-[#C8521A] p-8 rounded-2xl shadow">
                            <h3 className="text-white font-bold mb-2">Secure Records</h3>
                            <p className="text-white">
                                Keep all volunteer data safe and accessible.
                            </p>
                        </div>

                        <div className="bg-[#C8521A] p-8 rounded-2xl shadow">
                            <h3 className="text-white font-bold mb-2">Easy Management</h3>
                            <p className="text-white">
                                Automate tasks and focus on real impact.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* PORTALS */}
            <section className="py-24 max-w-7xl mx-auto px-8">

                <h2 className="text-center text-4xl font-bold mb-16">
                    Select Your Portal
                </h2>

                <div className="grid md:grid-cols-2 gap-12">

                    {/* VOLUNTEER */}
                    <div className="bg-white rounded-2xl shadow overflow-hidden">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuACxZ4mrpUN8QGt3itnP5izTcp-BQQYpYa3XXkOk-W3JON6u8xz9X5MhHEu15I1Bb0W33_eZTrtu-2Mg179gRr96Drr8vDj7ALA7lq3dEC-C1oQFZIlbdw0SRH5MTd0F6F2UZyfAwjM6LrXp97z8pJGJCTP_2W94sJsyv58SzG-WDer04Bu-xdepN1FL_HaNk6LWHMPWsH000LPnuc4hKqpXu-f20uzMu0SzcDuS8JDpcNj2cPm_psheM9XCIETMS4oRfUeFMD40HyN"
                            className="h-52 w-full object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-2xl font-bold">Volunteer Portal</h3>
                            <p className="text-[#58423b] mt-2">
                                Track hours and explore opportunities.
                            </p>
                            <Link href="/login">
                                <button className="mt-4 w-full py-3 bg-[#C8522A] text-white rounded-full">
                                    Log In
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* ADMIN */}
                    <div className="bg-white rounded-2xl shadow overflow-hidden">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJj6Ug3ZWf0q9kvXwnnCotTG2tNSHIIanLoxNEQ26b8ivovhj4JYPsy7gFywqcCs584D7N67GO40l2IFg5BhZJyJz5RPqXKs63Vk2B85lnadyv1gUgNkWF7oqUZaiqAIBzzfKF8ByrEfAirbxCqmKJzc92-tsPAt-eTskIuPZaKiySwk6rN6DMdNnaPXblWaopay1rqrrqAjg0U3jfhOftkR56o3t-l4_9Fwi8CwNA5zhaeIY6X-t3o2Bal30qTllfHLnEJilMiVuW"
                            className="h-52 w-full object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-2xl font-bold">Admin Portal</h3>
                            <p className="text-[#58423b] mt-2">
                                Manage projects and volunteers.
                            </p>
                            <Link href="/admin/login">
                                <button className="mt-4 w-full py-3 bg-[#a33811] text-white rounded-full">
                                    Log in
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-[#f9f3eb] py-10 text-center text-[#58423b]">
                © 2026 VolunteerHub. All rights reserved.
            </footer>

        </main>
    );
}