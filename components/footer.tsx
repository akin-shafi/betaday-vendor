"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Package, ShoppingBag, Wallet, User } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: TrendingUp, label: "Dashboard" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/orders", icon: ShoppingBag, label: "Orders" },
    { href: "/wallet", icon: Wallet, label: "Wallet" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-2 ${
              pathname === item.href ? "text-orange-600" : "text-gray-600"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
