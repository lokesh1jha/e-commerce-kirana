"use client";

import Link from "next/link";
import Button from "./ui/Button";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { ROUTES } from "@/lib/constants";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { openCart, cart } = useCart();

  useEffect(() => setMounted(true), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur sticky top-0 z-40">
      <div className="container flex h-14 items-center justify-between">
        <Link href={ROUTES.HOME} className="font-semibold">
          Kirana Store
        </Link>
        <nav className="flex items-center gap-4">
          <Link href={ROUTES.PRODUCTS} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Products</Link>

          {/* Cart button is available for everyone, opens right drawer */}
          <button onClick={openCart} className="relative text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </button>
          
          {status === "authenticated" ? (
            <>
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block">{session?.user?.name || session?.user?.email}</span>
                </Button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    {!isAdmin && (
                      <>
                        <Link
                          href={ROUTES.PROFILE_ORDERS}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href={ROUTES.PROFILE}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Profile
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link
                        href={ROUTES.ADMIN}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button onClick={() => signIn()} variant="secondary">Login</Button>
          )}

          {mounted && (
            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}