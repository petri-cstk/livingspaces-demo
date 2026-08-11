"use client";
import { useState } from "react";
import { cslp } from "@/lib/cstack";
import { useJstag, trackEvent, identifyUser, getRegionForZip, setRegionCookie } from "@/context/lyticsTracking";

// CMS editors configure this form's fields with a `data_and_insights_key` —
// any key that looks like PII must be identify()'d, not sent in the event.
const PII_KEY_PATTERN = /email|phone|name|address/i;
const ZIP_KEY_PATTERN = /zip|postal/i;

export default function UserProfileForm({ content }) {
  const jstag = useJstag();
  const [formData, setFormData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDropdownChange = (key, value) => {
    setDropdownValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Combine all form data with their respective data_and_insights_keys.
    // NOTE: this previously built `jstagData` and then discarded it —
    // the form never actually sent anything to Lytics. Wiring it up here.
    const jstagData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key]) jstagData[key] = formData[key];
    });
    Object.keys(dropdownValues).forEach((key) => {
      if (dropdownValues[key]) jstagData[key] = dropdownValues[key];
    });

    if (jstag && Object.keys(jstagData).length > 0) {
      const piiTraits = {};
      const nonPiiFields = {};
      let zipValue;

      Object.entries(jstagData).forEach(([key, value]) => {
        if (PII_KEY_PATTERN.test(key)) {
          piiTraits[key] = value;
        } else {
          nonPiiFields[key] = value;
        }
        if (ZIP_KEY_PATTERN.test(key)) zipValue = value;
      });

      if (Object.keys(piiTraits).length > 0) {
        identifyUser(jstag, piiTraits);
      }
      trackEvent(jstag, "profile_data_submitted", {
        form_name: "data_and_insights_form",
        ...nonPiiFields,
      });

      // A CMS editor can configure a zip/postal field on this form — if they
      // did, treat it the same as the header ZIP: derive + emit region.
      if (zipValue) {
        const region = getRegionForZip(zipValue);
        setRegionCookie(region);
        trackEvent(jstag, "region_detected", { zip: zipValue, region, source: "profile_form" });
      }
    }

    // Reset form
    setFormData({});
    setDropdownValues({});
    e.target.reset();
  };

  return (
    <div className="py-24 w-full flex justify-center items-center bg-gray-50">
      {content && (
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Title */}
            <h2
              className="text-3xl font-semibold text-neutral-700 mb-4 text-center"
              {...content?.$?.title}
            >
              {content?.title}
            </h2>

            {/* Description */}
            <p
              className="text-lg text-neutral-600 mb-8 text-center"
              {...content?.$?.description}
            >
              {content?.description}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Input Fields */}
              {content?.text_input?.length === 0 && (
                <div
                  className="h-32 visual-builder__empty-block-parent"
                  {...content?.$?.text_input}
                ></div>
              )}
              {content?.text_input?.map((input, index) => (
                <div
                  key={input?._metadata?.uid || index}
                  className="flex flex-col"
                  {...cslp(content, "text_input__", index)}
                >
                  <label
                    className="text-neutral-700 font-medium mb-2"
                    {...input?.$?.input_label}
                  >
                    {input?.input_label}
                  </label>
                  <input
                    type="text"
                    name={input?.data_and_insights_key}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors duration-200 text-neutral-700"
                    onChange={(e) =>
                      handleInputChange(
                        input?.data_and_insights_key,
                        e.target.value
                      )
                    }
                    value={formData[input?.data_and_insights_key] || ""}
                  />
                </div>
              ))}

              {/* Dropdown Menus */}
              {content?.dropdown_menu?.length === 0 && (
                <div
                  className="h-32 visual-builder__empty-block-parent"
                  {...content?.$?.dropdown_menu}
                ></div>
              )}
              {content?.dropdown_menu?.map((dropdown, index) => (
                <div
                  key={dropdown?._metadata?.uid || index}
                  className="flex flex-col"
                  {...cslp(content, "dropdown_menu__", index)}
                >
                  <label
                    className="text-neutral-700 font-medium mb-2"
                    {...dropdown?.$?.data_and_insights_key}
                  >
                    {dropdown?.data_and_insights_key
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <select
                    name={dropdown?.data_and_insights_key}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors duration-200 text-neutral-700 bg-white"
                    onChange={(e) =>
                      handleDropdownChange(
                        dropdown?.data_and_insights_key,
                        e.target.value
                      )
                    }
                    value={dropdownValues[dropdown?.data_and_insights_key] || ""}
                  >
                    <option value="">Select an option</option>
                    {dropdown?.payload_value?.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-brand text-white font-semibold rounded-md shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors duration-200 uppercase tracking-wider"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

