"use client"
import { useState } from 'react';
import { useJstag, trackEvent, identifyUser } from '@/context/lyticsTracking';

export default function LeadCapture({ content }) {
  const [inputValue, setInputValue] = useState("");
  const jstag = useJstag();

  function clickHandle(){
    // Explicit signup action — the email is PII, so it goes through
    // identify() only, never inside the generic event payload. The intent
    // event itself carries no PII.
    if (jstag && inputValue) {
      identifyUser(jstag, { email: inputValue });
      trackEvent(jstag, "newsletter_signup", { form_name: "lead_capture" });
    }
    setInputValue("");
  }
  const handleChange = (event) => {
    event.preventDefault();
    setInputValue(event.target.value);
  };

  return (
    <div className="mx-auto p-8 max-w-8xl">
      <div className="flex flex-row max-md:flex-col justify-center items-center">
        <div
          className="h-[430px] w-1/2 max-md:w-full flex flex-col content-center justify-center"
          style={{ backgroundColor: content?.background_color?.hex }}
        >
          <div className="flex flex-col justify-center font-extralight text-neutral-700 px-4">
            <div className="text-4xl flex justify-center font-thin" {...content?.$?.title}>
             {content?.title}
            </div>
            <div className="w-full my-2 flex justify-center"{...content?.$?.description}>{content?.description}</div>
          </div>
          <form onSubmit={clickHandle}className="mt-10 flex justify-center">
            <input
              className="rounded-l-lg py-3 px-4 max-md:px-2 border-t mr-0 border-b border-l border-r-0 text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
              placeholder={content?.input_label}
              value={inputValue}
              onChange={handleChange}
            />
            <button type="submit" className="px-6 max-md:px-3 py-3 rounded-r-lg bg-brand hover:bg-brand-dark text-white font-semibold uppercase tracking-wider shadow-sm transition-colors" {...content?.$?.button_text}>
             {content?.button_text}
            </button>
          </form>
        </div>
        <div className="w-1/2 max-md:w-full">
            <img src={content?.image?.url} className="object-cover w-full h-[430px]" {...content?.$?.image}></img>
        </div>
      </div>
    </div>
  );
}
