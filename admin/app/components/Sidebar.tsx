"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Chapters', href: '/chapters' },
  { name: 'Products', href: '/products' },
  { name: 'Finder Rules', href: '/finder-rules' },
  { name: 'Finder Requests', href: '/finder-requests' },
  { name: 'Manage Duas', href: '/duas' },
  { name: 'Users', href: '/users' },
  { name: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy-900 p-6 space-y-4 border-r border-gray-800">
      <nav>
        <ul>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className={`block px-4 py-2 rounded ${pathname === link.href ? 'bg-gold-500 text-black' : 'hover:bg-navy-800'}`}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
