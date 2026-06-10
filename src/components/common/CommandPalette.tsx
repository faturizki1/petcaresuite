import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, X, ArrowDown, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  routes?: { label: string; path: string }[];
}

interface SearchItem {
  label: string;
  path: string;
  subtitle?: string;
}

const pages = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Customers', path: '/staff/customers' },
  { label: 'Pets', path: '/staff/pets' }
];

export function CommandPalette({ open, onClose, routes }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [remoteResults, setRemoteResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const availablePages = routes ?? pages;

  const filteredPages = useMemo(
    () => availablePages.filter((page) => page.label.toLowerCase().includes(query.toLowerCase())),
    [availablePages, query]
  );

  const results = useMemo(() => {
    const pageItems = filteredPages.map((page) => ({ label: page.label, path: page.path }));
    return [...pageItems, ...remoteResults];
  }, [filteredPages, remoteResults]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setRemoteResults([]);
      setActiveIndex(0);
      return;
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results.length]);

  useEffect(() => {
    if (!query.trim()) {
      setRemoteResults([]);
      return;
    }

    const debounce = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryValue = query.trim();

        const [customerResponse, petResponse] = await Promise.all([
          supabase
            .from('customers')
            .select('id, full_name')
            .textSearch('full_name', queryValue, { type: 'plain' })
            .limit(5),
          supabase
            .from('pets')
            .select('id, name')
            .textSearch('name', queryValue, { type: 'plain' })
            .limit(5)
        ]);

        const customerItems = customerResponse.data?.map((customer) => ({
          label: `Customer: ${customer.full_name}`,
          path: `/staff/customers/${customer.id}`,
          subtitle: 'Customer record'
        })) ?? [];

        const petItems = petResponse.data?.map((pet) => ({
          label: `Pet: ${pet.name}`,
          path: `/staff/pets/${pet.id}`,
          subtitle: 'Pet profile'
        })) ?? [];

        setRemoteResults([...customerItems, ...petItems]);
      } catch {
        setRemoteResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, results.length - 1));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === 'Enter' && results.length) {
        event.preventDefault();
        navigate(results[activeIndex].path);
        onClose();
      }
    };

    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
  }, [activeIndex, navigate, onClose, results]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Search className="h-5 w-5" />
            <span className="text-sm font-semibold">Search pages, customers, pets</span>
          </div>
          <button
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={onClose}
            aria-label="Close command palette"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-800"
            placeholder="Type a command or search..."
            autoFocus
            aria-label="Search"
          />
          <div className="mt-4 max-h-72 overflow-auto">
            {isSearching && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">Searching records…</div>
            )}
            {!isSearching && results.map((item, index) => (
              <button
                key={`${item.path}-${index}`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full flex-col rounded-2xl px-4 py-3 text-left transition ${
                  activeIndex === index ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                {item.subtitle && <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</span>}
              </button>
            ))}
            {!isSearching && !results.length && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">No matching results.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
