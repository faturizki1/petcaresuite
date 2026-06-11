import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div>
      <nav className="bg-white border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">PetCare Suite</Link>
          <div className="flex gap-4">
            <Link to="/articles">Articles</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
      <footer className="border-t p-6 text-center text-sm text-slate-600">© PetCare Suite</footer>
    </div>
  );
}
