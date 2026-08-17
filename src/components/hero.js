"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./header";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  getVisitorNow,
  getScheduleState,
  getVisitorTimeZone,
  formatCountdown,
} from "@/lib/localSchedule";

export default function Hero({ content, locale, withHeader, cslp }) {
  const pathname = usePathname();

  // Local-timezone scheduling: evaluate only on the client (the server can't know
  // the visitor's timezone). `mounted` keeps SSR + first client render identical
  // (default hero) so there's no hydration mismatch; the swap happens after mount.
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const hasSchedule = Array.isArray(content) && content.some((h) => h?.schedule?.enable);
    if (!hasSchedule) return;
    // Re-evaluate every second so the hero flips live at the local boundary and
    // any countdown ticks. Only runs when a schedule is actually configured.
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [content]);

  if (!content || content?.length === 0) return <div></div>;

  let positionClass = "";
  let headlineClass = "";
  let bodyClass = "";
  let buttonClass = "";


  if (content && content?.length > 0) {
    const c0 = content?.[0];
    if (c0?.text_position === "Top Left") {
      positionClass = "top-16 left-16";
    } else if (c0?.text_position === "Top Center") {
      positionClass = "top-16 left-1/2 transform -translate-x-1/2 ";
    } else if (c0?.text_position === "Top Right") {
      positionClass = "top-16 right-16";
    } else if (c0?.text_position === "Left") {
      positionClass = "top-1/2 left-16 transform -translate-y-1/2";
    } else if (c0?.text_position === "Center") {
      positionClass =
        "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    } else if (c0?.text_position === "Right") {
      positionClass = "top-1/2 right-16 transform -translate-y-1/2";
      headlineClass = "text-right";
      bodyClass = "text-right";
      buttonClass = "justify-end";
    } else if (c0?.text_position === "Bottom Left") {
      positionClass = "bottom-16 left-16";
    } else if (c0?.text_position === "Bottom Center") {
      positionClass = "bottom-16 left-1/2 transform -translate-x-1/2";
    } else if (c0?.text_position === "Bottom Right") {
      positionClass = "bottom-16 right-16";
    }
  }

  if (content && content?.length > 0) {
    const c0 = content?.[0];
    if (c0?.alignment === "Left") {
      headlineClass = "text-left";
      bodyClass = "text-left";
      buttonClass = "justify-start";
    } else if (c0?.alignment === "Center") {
      headlineClass = "text-center";
      bodyClass = "text-center";
      buttonClass = "justify-center";
    } else if (c0?.alignment === "Right") {
      headlineClass = "text-right";
      bodyClass = "text-right";
      buttonClass = "justify-end";
    }
  }

  if (content && content?.length) {
    if (content?.[0]?.header_overlay !== true) {
      withHeader = false
    }
  }

  return (
    <>
      {(!withHeader && pathname === `/${locale}`) && <Header locale={locale} />}
      <motion.div
        inital="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
      >
        <div className=" ">

          {content?.map((hero, index) => {
            // --- Local-timezone scheduled override --------------------------------
            const now = mounted ? getVisitorNow() : null;
            const sched = mounted
              ? getScheduleState(hero?.schedule, now)
              : { active: false, phase: "disabled" };
            const ov = sched.active; // showing the scheduled override?
            const sch = hero?.schedule || {};

            // The content actually rendered: the scheduled override when active,
            // otherwise the hero's default fields.
            const view = ov
              ? {
                  header: sch.headline,
                  body: sch.body,
                  button_text: sch.button_text,
                  page: sch.page,
                  image: sch.image?.url || null,
                  headerTag: sch.$?.headline,
                  bodyTag: sch.$?.body,
                  buttonTag: sch.$?.button_text,
                  imageTag: sch.$?.image,
                }
              : {
                  header: hero?.header,
                  body: hero?.body,
                  button_text: hero?.button_text,
                  page: hero?.page,
                  image: hero?.image_options?.image?.url || null,
                  headerTag: hero?.$?.header,
                  bodyTag: hero?.$?.body,
                  buttonTag: hero?.$?.button_text,
                  imageTag: hero?.image_options?.$?.image,
                };

            // Show a countdown teaser only when the go-live is reasonably near
            // (within 14 days) so a far-future schedule doesn't clutter the page.
            const showCountdown =
              mounted &&
              sched.phase === "before" &&
              sched.activateAt &&
              sched.activateAt.getTime() - now.getTime() <= 14 * 24 * 60 * 60 * 1000;
            // ----------------------------------------------------------------------

            // Get aspect ratio class based on contentstack field
            let aspectRatioClass = "aspect-video"; // Default to 16:9
            if (hero?.aspect_ratio === "16:9") {
              aspectRatioClass = "aspect-video"; // 16:9
            } else if (hero?.aspect_ratio === "3:2") {
              aspectRatioClass = "aspect-[3/2]";
            } else if (hero?.aspect_ratio === "2:1") {
              aspectRatioClass = "aspect-[2/1]";
            } else if (hero?.aspect_ratio === "21:9") {
              aspectRatioClass = "aspect-[21/9]";
            }

            const mediaOpacity = hero?.media_overlay || "75%";
            const imageFile = view.image;
            const imageHeight = hero?.image_options?.image_height || "h-auto";
            // Default to full-height when image_height is unset — Personalize variant
            // deltas can drop image_options.image_height, which otherwise collapses the
            // hero to the short 21:9 aspect fallback.
            const isScreenHeight = !imageHeight || imageHeight === "h-screen";

            const videoFile = hero?.video_options?.video?.url || null;
            const videoControls = hero?.video_options?.video_controls;
            const videoLoop = hero?.video_options?.in_loop;

            const containerHeightClass = videoFile
              ? aspectRatioClass
              : isScreenHeight
                ? "min-h-[85vh] md:min-h-screen w-full"
                : aspectRatioClass;

            return (
              <div
                key={index}
                className={`bg-black relative isolate overflow-hidden flex ${containerHeightClass}`}
              >

                {videoFile && !ov ? (
                  <video
                    className="absolute inset-0 -z-10 min-h-full min-w-full h-full w-full object-cover"
                    style={{ opacity: mediaOpacity }}
                    autoPlay={videoControls === "Autoplay"}
                    controls={videoControls === "Show Controls"}
                    muted={videoControls === "Autoplay"}
                    loop={videoControls === "Autoplay"
                      ? true
                      : videoControls === "Show Controls"
                        ? videoLoop
                        : false
                    }
                    {...hero?.video_options?.$?.video}

                  >
                    <source src={videoFile} />
                  </video>
                ) : imageFile ? (
                  <img
                    className="absolute inset-0 -z-10 min-h-full min-w-full h-full w-full object-cover"
                    style={{
                      opacity: mediaOpacity
                    }}
                    src={imageFile}
                    {...view.imageTag}
                  />
                ) : null}

                {/* Local-timezone countdown teaser (before go-live) */}
                {showCountdown && (
                  <div className="absolute top-0 inset-x-0 z-20 flex justify-center pointer-events-none">
                    <div className="mt-4 rounded-full bg-black/70 backdrop-blur px-5 py-2 text-white text-xs sm:text-sm tracking-wide flex items-center gap-2 shadow-lg">
                      <span aria-hidden>⏰</span>
                      <span className="font-semibold">
                        {sch.headline ? sch.headline + " — live in " : "Goes live in "}
                        {formatCountdown(sched.activateAt.getTime() - now.getTime())}
                      </span>
                      <span className="opacity-70 hidden md:inline">
                        · at your local {sched.activateAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({getVisitorTimeZone()})
                      </span>
                    </div>
                  </div>
                )}

                {withHeader ? <Header color="white" locale={locale} /> : <></>}
                <div className={"absolute w-full max-w-2xl px-6 md:px-0 " + positionClass}>
                  <div className="w-full md:w-[42rem]">
                    <motion.div
                      variants={{
                        hidden: {
                          y: 300,
                        },
                        visible: {
                          y: 0,
                          transition: {
                            type: "spring",
                            stiffness: 170,
                            damping: 30,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      {...hero?.$?.text_position}
                    >
                      <h1
                        className={"mt-2 md:mt-8 !text-4xl sm:!text-5xl lg:!text-6xl leading-tight text-white " + headlineClass}
                        {...view.headerTag}
                      >
                        {view.header}
                      </h1>

                      <p
                        className={"mt-8 text-white " + bodyClass}
                        style={{ fontSize: hero?.body_text_size ? hero?.body_text_size : "16px" }}
                        {...view.bodyTag}
                      >
                        {view.body}
                      </p>

                      {
                        view.button_text ? (
                          <div
                            className={
                              "mt-10 flex items-center gap-x-6 " + buttonClass
                            }
                          >
                            <Link
                              href={
                                (view.page?.length > 0 && view.page?.[0]?.url) ? view.page?.[0]?.url : "#"
                              }
                              className="rounded-md button px-8 py-4 text-md tracking-widest uppercase font-bold text-white shadow-sm ring-2 ring-inset ring-gray-300 hover:text-neutral-700 hover:bg-gray-50"
                              {...view.buttonTag}
                            >
                              {view.button_text}
                            </Link>
                          </div>
                        ) : null
                      }
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
