"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className=" relative border-t-4 border-white bg-[#21232B] pt-14 pb-8 text-white "
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Grid Layout: 5 Columns */}
        <div className="grid grid-cols-1 gap-10 border-b-2 border-gray-800 pb-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">

          {/* Column 1: Brand & Newsletter (Span 4) */}
          <div className="space-y-4 text-left lg:col-span-4">
            {/* Brand Title */}
            <div className="flex items-center space-x-2">
              
              <span className=" text-xl font-bold tracking-tight text-white">
                Venus Contact Lens
              </span>
            </div>

            {/* Tagline */}
            <p className="max-w-sm text-xs leading-relaxed text-gray-400 ">
              Spreading joy, one cute pair at a time.
            </p>

            {/* Newsletter Subscription Box */}
            
          </div>

          {/* Column 2: Information (Span 2) */}
          

          {/* Column 3: Helpful Links (Span 2) */}
          <div className="space-y-3 text-left lg:col-span-2">
            <h4 className="border-b-2 border-dashed border-gray-700 pb-2  text-xs font-bold uppercase tracking-wider text-white">
              Helpful Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-300 ">
              <li>
                <Link
                  href="/track"
                  className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline"
                >
                  <span className="text-[10px] text-gray-400">❤</span> Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline"
                >
                  <span className="text-[10px] text-gray-400">❤</span> Order History
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline"
                >
                  <span className="text-[10px] text-gray-400">❤</span> Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline"
                >
                  <span className="text-[10px] text-gray-400">❤</span> Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Our Shop (Span 2) */}
          <div className="space-y-3 text-left lg:col-span-2">
            <h4 className="border-b-2 border-dashed border-gray-700 pb-2  text-xs font-bold uppercase tracking-wider text-white">
              Our Shop
            </h4>
            <ul className="space-y-2 text-xs text-gray-300 ">
              <li>
                <Link
                  href="/brands"
                  className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline"
                >
                  <span className="text-[10px] text-gray-400">❤</span> All Products
                </Link>
              </li>
              
              
            </ul>
          </div>

          {/* Column 5: Contact Us (Span 2) */}
          <div className="space-y-3 text-left lg:col-span-2" id="contact-us">
            <h4 className="border-b-2 border-dashed border-gray-700 pb-2  text-xs font-bold uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <div className="space-y-2 text-[11px] text-gray-400 ">
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">☎</span>
                <span className="font-bold text-white">
                  +95 999 999 999
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">✉</span>
                <a
                  href="mailto:hello@opticquest.com"
                  className="text-white hover:underline"
                >
                  hello@opticquest.com
                </a>
              </div>
            </div>

            {/* Social Links Icons */}
            <div className="pt-2">
              <div className="flex items-center space-x-2">
                {/* Facebook */}
                <a
                  aria-label="Facebook"
                  href="https://www.facebook.com/share/19VZGS2tgA/?mibextid=wwXIfr"
                  className="flex h-7 w-7 items-center justify-center rounded border-2 border-white bg-black text-white shadow-[2px_2px_0px_#ffffff] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-gray-800"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                </a>
                {/* X / Twitter */}
                <a
                  aria-label="Twitter / X"
                  href="#"
                  className="flex h-7 w-7 items-center justify-center rounded border-2 border-white bg-black text-white shadow-[2px_2px_0px_#ffffff] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-gray-800"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  aria-label="Instagram"
                  href="#"
                  className="flex h-7 w-7 items-center justify-center rounded border-2 border-white bg-black text-white shadow-[2px_2px_0px_#ffffff] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-gray-800"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm6.5-8.8a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H4V8h16v10z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6  text-[10px] sm:flex-row">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Venus Contact Lens. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 font-medium text-gray-400">
            <Link href="/faq" className="hover:text-white hover:underline">
              FAQ
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-white hover:underline">
              Privacy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-white hover:underline">
              Terms &amp; Condition
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
