"use client";
import { Fragment, useEffect, useState } from 'react';
import { cslp } from '@/lib/cstack';
import { useRouter } from 'next/navigation';
import { ContentstackClient } from "@/lib/contentstack-client";
import { setPersonalizeLiveAttributesCookie } from '@/lib/cspersonalize';
import { createClient } from '@/utils/supabase/client';
import { faCheck, faCircleUser as loggedIn, faCircleQuestion } from '@awesome.me/kit-610837e1f9/icons/classic/solid';
import { faCircleUser as loggedOut } from '@awesome.me/kit-610837e1f9/icons/classic/thin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure, Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon, Squares2X2Icon, ShoppingBagIcon, ShoppingCartIcon, MagnifyingGlassIcon, MapPinIcon, HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useJstag, trackEvent, triggerPersonalizeEvent, getRegionForZip, setRegionCookie } from '../context/lyticsTracking';
import { useParams } from 'next/navigation';
import { useSlidePanel } from '@/context/slidePanel.context';
import { useHeaderData } from '@/context/data.context';

// Helper function to delete cookie
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Demo store ZIP shown in the header (row 1). This is the on-site "region"
// signal personalization-brief.md calls out ("the header ZIP, e.g. 39180" →
// `region` attribute) — there's no real ZIP-entry UI in this codebase, so we
// derive `region_detected` from this already-displayed value rather than
// inventing a new input.
const STORE_ZIP = "28804";

export default function Header({ color, locale }) {
  // Seed from the server-fetched header (provided via HeaderDataProvider) so the
  // logo + nav render on the FIRST paint — including SSR — instead of mounting
  // empty and pushing the page down when the client fetch resolves.
  const seededHeaderArr = useHeaderData();
  const seededHeader = (Array.isArray(seededHeaderArr) ? seededHeaderArr[0] : seededHeaderArr?.[0]) || null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entry, setEntry] = useState(seededHeader || {});
  const [isLoading, setIsLoading] = useState(!seededHeader);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [avatar, setAvatar] = useState('');
  const router = useRouter();
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const slug = pathname.split('/').slice(2).join('/');
  const jstag = useJstag();
  const params = useParams();
  const { togglePanel } = useSlidePanel();

  const getUser = async () => {
    const supabase = createClient();
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    return user;
  }

  useEffect(() => {
    const init = async () => {
      const user = await getUser();
      if (user) {
        const saved = localStorage.getItem('profile');
        if (saved) {
          setSelectedProfile(saved);
          const foundProfile = profiles?.find(p => p.fname === saved);
          if (foundProfile) {
            setAvatar(foundProfile.avatar);
            setPersonalizeLiveAttributesCookie({ client_type: foundProfile.audience });
          }
        }
      }
    };
    init();
  }, [profiles]);

  async function logout() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut({ scope: 'local' });
    deleteCookie('oauth_user');
    deleteCookie('oauth_token');
    deleteCookie('oauth_session');
    localStorage.setItem('profile', "");
    setPersonalizeLiveAttributesCookie({ client_type: "" });
    if (jstag) jstag.clearCookies();
    window.location.reload();
    window.location.reload();
  }

  // Generate random state for CSRF protection
  function generateState() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  // Handle OAuth login
  function handleOAuthLogin() {
    // Generate and store state
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);

    // Build OAuth URL
    const authUrl = new URL(process.env.NEXT_PUBLIC_OAUTH_URL);
    authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/oauth/callback`);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    // Redirect to OAuth server
    window.location.href = authUrl.toString();
  }

  const getContent = async () => {
    const entry = await ContentstackClient.getElementByTypeWithRefs("header", locale, [
      "menu_items.page",
      "menu_items.sub_items.page",
    ], seededHeaderArr);
    setEntry(entry?.[0] ?? {});
    setIsLoading(false);
  };

  const getProfiles = async (user_id) => {
    try {
      const response = await fetch(`/api/profiles/${user_id}`, { method: 'GET' });
      if (!response.ok) throw response;
      const result = await response.json();

      const tempProfiles = (result?.profiles ?? []).map(profile => ({
        fname: profile.first_name,
        lname: profile.last_name,
        audience: profile.audience,
        id: profile.id,
        avatar: profile.avatar_url,
      }));
      setProfiles(tempProfiles);

      const saved = localStorage.getItem('profile');
      if (saved) {
        setSelectedProfile(saved);
        const foundProfile = tempProfiles.find(p => p.fname === saved);
        if (foundProfile) {
          setAvatar(foundProfile.avatar);
          setPersonalizeLiveAttributesCookie({ client_type: foundProfile.audience });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const init = async () => {
      const currentUser = await getUser();
      if (currentUser) {
        getProfiles(currentUser.id);
      }
      ContentstackClient.onEntryChange(getContent);
      if (jstag) jstag.call("resetPolling");
    };
    init();
  }, []);

  // region_detected — fires once per browser session (Header remounts on
  // every page nav, so guard with sessionStorage rather than re-sending on
  // each page). Backs the Sunbelt/Northern region audiences in
  // personalization-brief.md.
  useEffect(() => {
    if (!jstag || typeof window === "undefined") return;
    const region = getRegionForZip(STORE_ZIP);
    setRegionCookie(region);
    const ALREADY_SENT_KEY = "ls_region_detected_sent";
    if (window.sessionStorage.getItem(ALREADY_SENT_KEY)) return;
    window.sessionStorage.setItem(ALREADY_SENT_KEY, "1");
    trackEvent(jstag, "region_detected", { zip: STORE_ZIP, region, source: "header_zip" });
  }, [jstag]);

  if (isLoading) return;

  function changeLang(language) {
    const path = language + '/' + slug;
    router.push("/" + path);
  }

  const changeProfile = async (name) => {
    setSelectedProfile(name);

    if (name === "") {
      localStorage.setItem('profile', "");
      setPersonalizeLiveAttributesCookie({ client_type: "" });
    }
    else {
      const profile = profiles.find(p => p.fname === name);
      localStorage.setItem('profile', profile.fname);
      setPersonalizeLiveAttributesCookie({ client_type: profile.audience });
    }
    window.location.reload();
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  // Row 2 utility links — static placeholders (point at "/" to avoid dead ends).
  // A few of these map directly to on-site behaviors personalization-brief.md
  // needs (trade audience, catalog/financing intent) — those get an
  // intent-tracking click handler even though the destination is still a
  // placeholder; tracking the click is honest signal, it doesn't require the
  // landing page to exist yet.
  const utilityLinks = [
    'Bestsellers', 'Shop by Room', 'Small Spaces', 'Contract Grade',
    'Trade Program', 'Catalogs', 'Shop by Style', 'Financing',
  ];

  const UTILITY_LINK_EVENTS = {
    'Trade Program': 'trade_program_view',
    'Catalogs': 'catalog_view',
    'Financing': 'financing_view',
  };

  const trackUtilityLinkClick = (label) => {
    const eventName = UTILITY_LINK_EVENTS[label];
    if (!eventName || !jstag) return;
    trackEvent(jstag, eventName, { link_label: label, nav_section: "utility" });
    if (eventName === "trade_program_view") triggerPersonalizeEvent("trade_program_view");
  };

  const trackWishlistClick = () => {
    if (!jstag) return;
    // Global header affordance — no product context is available here (there
    // is no per-product wishlist UI in this codebase yet), so this reports
    // wishlist intent with page context only. See PDP for product_view /
    // add_to_cart, which do carry full product context.
    trackEvent(jstag, "add_to_wishlist", { source: "header" });
  };

  const trackStoreLocatorClick = () => {
    if (!jstag) return;
    trackEvent(jstag, "store_locator_view", { zip: STORE_ZIP });
  };

  // Centered "LIVING SPACES" wordmark — solid white bar → dark wordmark is the
  // visible one. Both CMS logo fields stay CSLP-tagged for Visual Builder editing
  // (light_logo kept mounted-but-hidden so its $ binding survives).
  const logo = (
    <Link
      href="/"
      prefetch={false}
      onClick={() => { window.location.href = "/"; }}
      aria-label="Living Spaces home"
      className={"block" + (entry?.image_width === "Auto" ? " w-auto" : " w-40")}
    >
      <img className="mx-auto h-8 w-auto" src={entry?.dark_logo?.url} {...entry?.$?.dark_logo} alt="Living Spaces" />
      <img className="hidden" src={entry?.light_logo?.url} {...entry?.$?.light_logo} alt="" />
    </Link>
  );

  // Search box — controlled input; no search route exists, so submit is a no-op.
  const searchBox = (compact) => (
    <form
      onSubmit={(e) => e.preventDefault()}
      role="search"
      className={"flex " + (compact ? "w-full" : "w-[360px] max-w-full")}
    >
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="min-w-0 flex-1 border border-r-0 border-gray-300 px-4 py-2.5 text-sm text-brand placeholder:text-gray-400 outline-none focus:border-brand"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center bg-brand px-3 text-white transition-colors hover:bg-brand-dark"
      >
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );

  // Login / profile popover — preserves Supabase auth + Personalize profile switching.
  const accountMenu = (
    <>
      {!user &&
        <Popover className="relative flex">
          <PopoverButton className="flex items-center outline-none" aria-label="Account">
            <FontAwesomeIcon icon={loggedOut} className="text-2xl" />
          </PopoverButton>

          <PopoverPanel anchor="bottom end" className="z-50 flex flex-col py-2 px-4 rounded text-neutral-700 bg-[#F5F1EC] shadow-lg">
            <button
              onClick={handleOAuthLogin}
              className="text-nowrap font-light cursor-pointer text-left"
            >
              Log In
            </button>
            <div className="my-1 h-px bg-black/25" />
            <Link href={`/${locale}/orders`} className="font-light text-nowrap">
              MY ORDERS
            </Link>
          </PopoverPanel>
        </Popover>
      }
      {user &&
        <Popover className="relative flex">
          <PopoverButton className="flex items-center outline-none" aria-label="Account">
            {avatar &&
              <img className="w-8 h-8 min-w-8 min-h-8 flex-shrink-0 rounded-full object-cover" src={avatar} />
            }
            {!avatar &&
              <FontAwesomeIcon icon={loggedIn} className="text-3xl" />
            }
          </PopoverButton>

          <PopoverPanel anchor="bottom end" className="z-50 flex flex-col py-2 px-4 gap-y-1 bg-[#F5F1EC] rounded-lg mt-2 text-neutral-700 shadow-lg">
            <PopoverButton
              className="group flex w-full items-center font-light"
              onClick={() => changeProfile("")}
            >
              <FontAwesomeIcon icon={faCheck} className={`mr-2 ${!selectedProfile ? "" : "opacity-0"}`} />
              Anonymous
            </PopoverButton>
            {profiles?.map((profile, index) => (
              <PopoverButton key={index}
                className="group flex w-full items-center font-light"
                onClick={() => changeProfile(profile.fname)}
              >
                <FontAwesomeIcon icon={faCheck} className={`mr-2 ${selectedProfile === profile.fname ? "" : "opacity-0"}`} />
                {profile.fname}
              </PopoverButton>
            ))}
            <div className="my-1 h-px bg-black/25" />
            <Link href="/profiles" className="font-light">MANAGE PROFILES</Link>
            <div className="my-1 h-px bg-black/25" />
            <Link href={`/${locale}/orders`} className="font-light text-nowrap">
              MY ORDERS
            </Link>
            <div className="my-1 h-px bg-black/25" />
            <button
              className="text-nowrap font-light cursor-pointer text-left"
              onClick={handleOAuthLogin}
            >
              SWITCH ACCOUNT
            </button>
            <a
              className="text-nowrap font-light cursor-pointer"
              onClick={logout}
            >
              LOG OUT
            </a>
          </PopoverPanel>
        </Popover>
      }
    </>
  );

  // Locale switcher — preserved next-intl behavior (changeLang pushes /<lang>/<slug>).
  const localeSelect = (
    <select
      className="bg-transparent text-sm text-brand outline-none cursor-pointer"
      value={locale}
      onChange={(e) => changeLang(e.target.value)}
      aria-label="Select language"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
      <option value="de">DE</option>
    </select>
  );

  // Cart embed — window.RedPandaCart hydrates the count into any `.rp-cart` element.
  const cartButton = (
    <button
      type="button"
      className="rp-cart relative flex min-h-[44px] min-w-[44px] items-center justify-center text-brand outline-none transition-colors hover:opacity-70"
      aria-label="Shopping cart (embed)"
    >
      <ShoppingCartIcon className="h-6 w-6" aria-hidden />
    </button>
  );

  return (
    <header
      className={
        "w-full bg-white text-brand font-paragraph border-b border-gray-200 " +
        (color === "white" ? "absolute top-0 left-0 z-30" : "relative z-30")
      }
    >
      {/* ===================== DESKTOP (lg and up) ===================== */}
      <div className="hidden lg:block">

        {/* Row 1 — top bar: search | logo | zip + account + wishlist + cart */}
        <div className="mx-auto grid max-w-8xl grid-cols-3 items-center gap-4 px-8 py-4">
          <div className="flex justify-start">
            {searchBox(false)}
          </div>

          <div className="flex justify-center">
            {logo}
          </div>

          <div className="flex items-center justify-end gap-5">
            <button
              type="button"
              className="flex items-center gap-1.5 outline-none"
              aria-label="Store location"
              onClick={trackStoreLocatorClick}
            >
              <MapPinIcon className="h-5 w-5" aria-hidden />
              <span className="text-sm font-medium">{STORE_ZIP}</span>
            </button>

            {localeSelect}

            {accountMenu}

            <button
              type="button"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-brand outline-none transition-colors hover:opacity-70"
              aria-label="Wishlist"
              onClick={trackWishlistClick}
            >
              <HeartIcon className="h-6 w-6" aria-hidden />
            </button>

            {cartButton}
          </div>
        </div>

        {/* Row 2 — utility nav (centered, static placeholders) */}
        <nav aria-label="Utility" className="flex flex-wrap justify-center gap-x-7 gap-y-1 px-8 pb-3 text-sm tracking-wide">
          {utilityLinks.map((label) => (
            <Link
              key={label}
              href="/"
              onClick={() => trackUtilityLinkClick(label)}
              className="text-brand/90 transition hover:text-brand hover:underline underline-offset-4"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Row 3 — primary category nav (CMS-driven from menu_items) */}
        <div className="border-t border-gray-200">
          <nav
            aria-label="Categories"
            className="mx-auto flex max-w-8xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-8 py-3 text-sm font-bold uppercase tracking-wide"
            {...entry?.$?.menu_items}
          >
            {(entry?.menu_items?.length > 0) && entry.menu_items.map((item, index) => {
              const href = (item?.page?.length > 0 && item?.page?.[0]?.url) ? item.page[0].url : "/";
              const isClearance = item?.text?.trim().toLowerCase() === "clearance";
              const hasSubs = item?.sub_items?.length > 0;
              return (
                <div key={index} className="relative group" {...cslp(entry, 'menu_items__', index)}>
                  <div {...item.$?.page}>
                    <Link
                      href={href}
                      className={classNames(
                        "transition hover:opacity-70",
                        isClearance ? "text-accent" : "text-brand"
                      )}
                      {...item.$?.text}
                    >
                      {item.text}
                    </Link>
                  </div>
                  {hasSubs && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 hidden group-hover:block">
                      <div className="min-w-[260px] bg-white border border-gray-200 shadow-lg rounded-[1px] py-2">
                        {item.sub_items.map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            href={(sub?.page?.length > 0 && sub?.page?.[0]?.url) ? sub.page[0].url : "/"}
                            className="block px-5 py-2 text-sm font-normal normal-case tracking-normal text-brand hover:bg-cream"
                            {...sub.$?.text}
                          >
                            {sub.text}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <Link href="/" className="text-brand transition hover:opacity-70">
              More +
            </Link>
          </nav>
        </div>
      </div>

      {/* ===================== MOBILE (below lg) ===================== */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center outline-none"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-7 w-7" />
          </button>

          <div className="flex-1 px-2">
            {logo}
          </div>

          <div className="flex items-center gap-2">
            {accountMenu}
            {cartButton}
          </div>
        </div>

        {/* Compact search row */}
        <div className="px-4 pb-3">
          {searchBox(true)}
        </div>
      </div>

      <div
        className={`p-5 right-0 top-0 w-full z-50 duration-200 ease-in-out bg-white fixed h-full ${menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-700">{localeSelect}</div>
          <button
            className="cursor-pointer text-neutral-700"
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <XMarkIcon className="h-10" />
          </button>
        </div>
        <div className="mt-4 flex flex-col text-neutral-700 text-2xl leading-10 uppercase font-paragraph">
          {entry?.menu_items?.map((item, index) => {
            if (item.sub_items?.length > 0) {
              return (
                <Disclosure as="div" className="-mx-3" key={index + item.text}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center pl-3 pr-3.5 uppercase font-paragraph">
                        {item.text}
                        <ChevronDownIcon
                          className={classNames(
                            open ? "rotate-180" : "",
                            "ml-2 h-7 w-7 flex-none"
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2 pb-2 font-paragraph">
                        {item.sub_items.map((subItem, subIdx) => (
                          <Disclosure.Button
                            key={subIdx + subItem?.text}
                            as="a"
                            href={subItem?.page?.[0]?.url ?? "#"}
                            className="block rounded-lg pt-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50 font-paragraph"
                          >
                            {subItem?.text}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              );
            } else {
              const isClearance = item?.text?.trim().toLowerCase() === "clearance";
              return (
                <Link
                  key={index}
                  href={(item?.page?.length > 0 && item?.page?.[0]?.url) ? item?.page?.[0]?.url : "/"}
                  className={isClearance ? "text-accent" : ""}
                >
                  {item.text}
                </Link>
              );
            }
          })}
          <button
            type="button"
            className="rp-cart mt-10 flex w-full items-center gap-3 border-2 border-brand px-4 py-3 text-left text-neutral-700 outline-none transition-colors hover:bg-brand hover:text-white"
            aria-label="Shopping cart"
          >
            <ShoppingBagIcon className="h-8 w-8 shrink-0" aria-hidden />
            <span className="font-paragraph text-xl uppercase tracking-wide">Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
}
