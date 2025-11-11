import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { Mail, MessageCircle, Phone, MessageSquare, Check } from "lucide-react";
import type { JSX } from "react";
import type { StepProps } from "../dashboard/types";
import axios from "axios";

const Step2 = ({ goBack, jumpToStep, formData, setFormData }: StepProps) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(
    formData.selectedTier || null
  );
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  //const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isTierLoading, setIsTierLoading] = useState(true);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const status = formData.upgradeStatus;



  const BASE_URL = "https://api.onboardingportal.cloudsentrics.org/api";

  // Tier definitions
  const tiers = [
    {
      id: "standard",
      title: "STANDARD TIER",
      storage: "300GB",
      rank: 1,
      channels: ["Dashboard", "Email"],
      response: "Within 24 hrs",
      availability: "24/7 support coverage",
      extras: "Access to knowledge base & FAQs",
    },
    {
      id: "business",
      title: "BUSINESS TIER",
      storage: "600GB",
      rank: 2,
      channels: ["Dashboard", "Live Chat (App/Web)", "WhatsApp"],
      response: "Within 24 hrs",
      availability: "24/7 support coverage",
      extras:
        "Priority handling over Standard customers. WhatsApp Support for quick queries.",
    },
    {
      id: "premium",
      title: "PREMIUM TIER",
      storage: "2TB",
      rank: 3,
      channels: ["Dashboard", "Email", "Live Chat", "Phone", "WhatsApp"],
      response: "Within 4 hrs (priority SLA)",
      availability: "24/7 support coverage",
      extras:
        "Dedicated account manager/customer success rep. Priority escalation for critical issues.",
    },
    // ✅ Add this:
    {
      id: "custom",
      title: "CUSTOM TIER",
      storage: "",
      rank: 4,
      channels: [],
      response: "",
      availability: "",
      extras: "",
    },
  ];

  const channelIcons: Record<string, JSX.Element> = {
    Email: <Mail size={18} className="text-blue-700" />,
    "Live Chat": <MessageSquare size={18} className="text-green-600" />,
    "Live Chat (App/Web)": <MessageSquare size={18} className="text-green-600" />,
    Phone: <Phone size={18} className="text-indigo-600" />,
    WhatsApp: <MessageCircle size={18} className="text-green-500" />,
    Dashboard: (
      <div className="w-5 h-5 rounded bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
        D
      </div>
    ),
  };

  useEffect(() => {
    const fetchCurrentTierAndStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userEmail = user.email || user.companyEmail;
        if (!userEmail) {
          console.warn("⚠️ No valid email found in localStorage user object");
          return;
        }

        // --- Fetch current tier request
        const tierRes = await axios.get(`${BASE_URL}/upgrade/request/by-email/${userEmail}`);
        const backendData = tierRes.data.data || {};
        console.log("📦 Backend tier data:", backendData);

        // Extract current tier info
        const backendTier = backendData.selectedTier || backendData.currentTier || null;
        setCurrentTier(backendTier);
        if (backendTier) setSelectedTier(backendTier);

        // Extract tierTitle and tierStorage for new validation
        const tierTitle = backendData?.tierTitle || "";
        const tierStorage = backendData?.tierStorage || "";

        // --- Fetch upgrade status
        const statusRes = await axios.get(`${BASE_URL}/upgrade/by-email/${userEmail}`);
        const status = statusRes.data?.status || "None";
        console.log("📩 Upgrade Status:", status);

        // Save status in formData for reuse
        setFormData((prev) => ({
          ...prev,
          upgradeStatus: status,
        }));

        // --- Show pending notice if upgrade is pending
        if (status === "Pending") {
          Swal.fire({
            icon: "info",
            title: "Upgrade Request Pending",
            text: "Your upgrade request is under review. You can proceed once it’s approved.",
            confirmButtonColor: "#032352",
          });
        }

        // --- New validation: enable Next if no tier exists
        if (!tierTitle && !tierStorage) {
          console.log("🟢 No existing tier → Next button enabled");
          setIsNextEnabled(true);
        } else {
          // Otherwise, enable Next only if upgrade is approved
          setIsNextEnabled(false);
        }
      } catch (err) {
        console.error("❌ Error fetching tier or status:", err);
        setCurrentTier(null);
        setIsNextEnabled(false);
      } finally {
        setIsTierLoading(false);
        console.log("✅ Finished fetching tier and status");
      }
    };

    fetchCurrentTierAndStatus();
  }, []);


  // Fetch current tier from backend
  useEffect(() => {
    const fetchCurrentTier = async () => {
      try {
        console.log("✅ Fetching current tier...");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("LocalStorage user:", user);

        if (!user || (!user.email && !user.companyEmail)) {
          console.warn("⚠️ No user email found in localStorage!");
          return;
        }
        const userEmail = user.email || user.companyEmail; // ✅ check both
        if (!userEmail) {
          console.warn("⚠️ No valid email found in localStorage user object");
          return;
        }

        console.log("📩 Using email for tier fetch:", userEmail);
        //const res = await axios.get(`${BASE_URL}/request/by-email/${userEmail}`);
        const res = await axios.get(`${BASE_URL}/upgrade/request/by-email/${userEmail}`);


        console.log("Backend response:", res.data);

        // ✅ Check upgrade status if available
        if (res.data?.status) {
          console.log("🟡 Upgrade request status:", res.data.status);
          setFormData((prev) => ({
            ...prev,
            upgradeStatus: res.data.status, // store it in formData for reuse
          }));

          // If the user has a pending upgrade, show notice
          if (res.data.status === "Pending") {
            Swal.fire({
              icon: "info",
              title: "Upgrade Request Pending",
              text: "Your upgrade request is under review. You can proceed once it’s approved.",
              confirmButtonColor: "#032352",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload(); // 🔁 reloads after user clicks OK
              }
            });
          }
        }

        const backendTier = res.data.data?.selectedTier || res.data.data?.currentTier || null;
        console.log("Extracted backendTier:", backendTier);

        setCurrentTier(backendTier);
        if (backendTier) setSelectedTier(backendTier);

      } catch (err) {
        console.error("❌ Error fetching current tier:", err);
        setCurrentTier(null);
      } finally {
        console.log("✅ Finished tier fetch");
        setIsTierLoading(false);
      }
    };

    fetchCurrentTier();
  }, []);





  const handleSelectTier = async (tierId: string) => {
    console.log("🟦 handleSelectTier triggered for:", tierId);

    if (tierId === "custom") {
  const { value: customInput } = await Swal.fire({
    title: "Custom Tier Request",
    html:
      '<input id="customAmount" type="number" class="swal2-input" placeholder="Enter amount">' +
      '<select id="customUnit" class="swal2-select">' +
      '<option value="GB">GB</option>' +
      '<option value="TB">TB</option>' +
      '</select>' +
      '<textarea id="customNote" class="swal2-textarea" placeholder="Additional notes"></textarea>',
    focusConfirm: false,
    preConfirm: () => {
      const amount = Number(
        (document.getElementById("customAmount") as HTMLInputElement)?.value
      );
      const unit = (document.getElementById("customUnit") as HTMLSelectElement)?.value;
      const note = (document.getElementById("customNote") as HTMLTextAreaElement)?.value;

      if (!amount || isNaN(amount)) {
        Swal.showValidationMessage("Please enter a valid number for amount");
        return null;
      }

      if (unit === "GB" && amount < 50) {
        Swal.showValidationMessage("Minimum capacity for a custom tier is 50 GB");
        return null;
      }

      return { amount, unit, note };
    },
  });

  if (!customInput) return; // cancelled or invalid

  // 🔍 Check current tier and prevent downgrade
  const currentTierInfo = tiers.find(
    (t) =>
      t.id.toLowerCase() === currentTier?.toLowerCase() ||
      t.title.toLowerCase() === currentTier?.toLowerCase()
  );

  if (currentTierInfo) {
    // Convert storage values into GB for comparison (handles TB vs GB)
    const parseToGB = (val: string) => {
      const [num, unit] = val.split(" ");
      const n = parseFloat(num);
      return unit.toUpperCase().includes("TB") ? n * 1024 : n;
    };

    const currentGB = parseToGB(currentTierInfo.storage);
    const newGB =
      customInput.unit === "TB"
        ? customInput.amount * 1024
        : customInput.amount;

    if (newGB < currentGB) {
      await Swal.fire({
        icon: "warning",
        title: "We cannot have a downgrade",
        html: `You are currently on <b>${currentTierInfo.title}</b> (${currentTierInfo.storage}). Downgrades are not permitted.`,
        confirmButtonColor: "#032352",
      });
      return; // 🚫 Stop further processing
    }
  }

  // ✅ If upgrade or first-time selection
  setSelectedTier("custom");
  setFormData((prev) => ({
    ...prev,
    selectedTier: "custom",
    tierDetails: {
      title: "CUSTOM TIER",
      storage: `${customInput.amount} ${customInput.unit}`,
      channels: "",
      response: "",
      availability: "",
      extras: customInput.note,
    },
    customTierRequest: customInput,
  }));

  await Swal.fire({
    icon: "success",
    title: "Custom Tier Request Saved",
    text: `Your request for ${customInput.amount} ${customInput.unit} has been saved.`,
    confirmButtonColor: "#032352",
  });

  setIsNextEnabled(true);
  return;
}


    // --- Helper to normalize tier strings (handles "BUSINESS TIER", "business", etc.)
    const resolveTierId = (value?: string | null): string | null => {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      const byId = tiers.find((t) => t.id === v);
      if (byId) return byId.id;
      const byTitle = tiers.find((t) => t.title.toLowerCase() === v);
      if (byTitle) return byTitle.id;
      const contains = tiers.find(
        (t) => v.includes(t.id) || t.title.toLowerCase().includes(v)
      );
      return contains ? contains.id : null;
    };

    // --- Find selected tier info
    const selectedTierInfo = tiers.find((t) => t.id === tierId);
    if (!selectedTierInfo) {
      console.warn("❌ No tier found for ID:", tierId);
      return;
    }

    // --- Resolve current tier safely
    const currentTierIdResolved = resolveTierId(currentTier);
    const currentTierInfo = tiers.find((t) => t.id === currentTierIdResolved) || null;

    console.log("Current Tier state (raw):", currentTier);
    console.log("Current Tier resolved id:", currentTierIdResolved);
    console.log("Current Tier Info:", currentTierInfo);

    // --- First-time selection (no tier info found)
    if (!currentTierInfo) {
      console.log("🟢 First-time tier selection flow triggered");
      setSelectedTier(tierId);
      setFormData((prev) => ({
        ...prev,
        selectedTier: tierId,
        tierDetails: {
          title: selectedTierInfo.title,
          storage: selectedTierInfo.storage,
          channels: selectedTierInfo.channels.join(", "),
          response: selectedTierInfo.response,
          availability: selectedTierInfo.availability,
          extras: selectedTierInfo.extras,
        },
      }));

      // ✅ Enable the Next button
      setIsNextEnabled(true);

      await Swal.fire({
        icon: "success",
        title: "Tier Selected",
        text: `You’ve selected the ${selectedTierInfo.title}.`,
        confirmButtonColor: "#032352",
      });
      return;
    }

    // --- Same Tier (no change)
    if (selectedTierInfo.rank === currentTierInfo.rank) {
      console.log("ℹ️ Same tier selected — no change");
      await Swal.fire({
        icon: "info",
        title: "Same Tier Selected",
        text: `You are already on ${currentTierInfo.title}.`,
        confirmButtonColor: "#032352",
      });
      return;
    }

    // --- Downgrade attempt
    if (selectedTierInfo.rank < currentTierInfo.rank) {
      console.log("⚠️ Downgrade attempt detected");
      await Swal.fire({
        icon: "warning",
        title: "We cannot have a downgrade",
        text: `You are currently on ${currentTierInfo.title}. Downgrades are not permitted.`,
        confirmButtonColor: "#032352",
      });
      return;
    }

    // --- Upgrade flow
    console.log(
      "⬆️ Upgrade flow reached:",
      currentTierInfo.title,
      "→",
      selectedTierInfo.title
    );

    const confirmUpgrade = await Swal.fire({
      title: "Confirm Upgrade",
      html: `You are currently on <b>${currentTierInfo.title}</b> (${currentTierInfo.storage}) and about to upgrade to <b>${selectedTierInfo.title}</b> (${selectedTierInfo.storage}).<br><br>Do you want to continue?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Upgrade",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#032352",
      cancelButtonColor: "#d33",
    });

    if (confirmUpgrade.isConfirmed) {
      // ✅ perform your upgrade request or API call first
      // await axios.post(...)

      Swal.fire({
        icon: "success",
        title: "Upgrade Request Submitted",
        text: `Your upgrade to ${selectedTierInfo.title} has been submitted successfully.`,
        confirmButtonColor: "#032352",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload(); // 🔁 reloads only after user confirms the success message
        }
      });
    }


    if (!confirmUpgrade.isConfirmed) {
      console.log("🚫 Upgrade cancelled by user");
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("👤 User from localStorage:", user);

      const payload = {
        userId: user._id || user.id || null,
        fullName: user.fullName || user.name,
        email: user.companyEmail || user.email,
        previousTier: currentTierInfo.title,
        newTier: selectedTierInfo.title,
        previousStorage: currentTierInfo.storage,
        newStorage: selectedTierInfo.storage,
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      console.log("🚀 Sending upgrade request payload:", payload);

      if (!payload.email) {
        console.error("❌ Missing email in payload");
        await Swal.fire({
          icon: "error",
          title: "Missing Email",
          text: "No valid email found in your profile. Please log in again.",
          confirmButtonColor: "#032352",
        });
        return;
      }

      const res = await axios.post(`${BASE_URL}/upgrade/request`, payload);
      console.log("✅ Upgrade successful:", res.data);

      Swal.fire({
        icon: "success",
        title: "Upgrade Request Submitted",
        text: `Your upgrade to ${selectedTierInfo.title} has been submitted successfully.`,
        confirmButtonColor: "#032352",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload(); // ✅ reloads the page
        }
      });


      setSelectedTier(tierId);
      setFormData((prev) => ({
        ...prev,
        selectedTier: tierId,
        tierDetails: {
          title: selectedTierInfo.title,
          storage: selectedTierInfo.storage,
          channels: selectedTierInfo.channels.join(", "),
          response: selectedTierInfo.response,
          availability: selectedTierInfo.availability,
          extras: selectedTierInfo.extras,
        },
      }));
    } catch (err: any) {
      console.error("❌ Upgrade request failed:", err);
      Swal.fire({
        icon: "error",
        title: "Upgrade Request Failed",
        text:
          err.response?.data?.message ||
          "An error occurred while submitting your upgrade request.",
        confirmButtonColor: "#032352",
      });
    } finally {
      setLoading(false);
      console.log("⏹️ Finished handleSelectTier process");
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-6 py-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white px-4 sm:px-8 py-6 sm:py-10 rounded-2xl shadow-xl w-full max-w-7xl"
      >
        {/* Request Type */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-3xl font-bold text-blue-900 mb-3 sm:mb-4">
            REQUEST TYPE
          </h3>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-3 sm:gap-4 text-base sm:text-xl">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox w-6 h-6 cursor-not-allowed opacity-60"
                disabled
              />
              <span>Additional AWS Account(s)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox w-6 h-6"
                checked
                readOnly
              />
              <span>Storage(s)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-not-allowed opacity-60">
              <input
                type="checkbox"
                className="form-checkbox w-6 h-6"
                disabled
              />
              <span>Change to Existing Account or Storage(s) settings</span>
            </label>
          </div>
        </div>

        <p className="text-base sm:text-xl text-gray-700 mb-6 leading-relaxed">
          Note: All Cloud Sentrics Storage comes by default with versioning and SSE-S3 encryption enabled. Additional settings may incur extra charges.
        </p>

        <h4 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Choose any of the tiers for your company
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`border rounded-xl p-5 sm:p-8 shadow-md flex flex-col justify-between transition ${selectedTier === tier.id
                ? "border-blue-700 ring-2 ring-blue-200"
                : "border-gray-300"
                }`}
            >
              <div>
                <h5 className="text-lg sm:text-2xl font-bold text-blue-900 mb-2">
                  {tier.title}
                </h5>
                <p className="text-gray-800 font-semibold text-base sm:text-lg mb-4 sm:mb-6">
                  {tier.storage}
                </p>

                <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg">
                  <p>
                    <span className="font-semibold block mb-1">CHANNELS:</span>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {tier.channels.map((ch) => (
                        <div
                          key={ch}
                          className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg"
                        >
                          {channelIcons[ch] || null}
                          <span className="text-sm sm:text-base">{ch}</span>
                        </div>
                      ))}
                    </div>
                  </p>
                  <p>
                    <span className="font-semibold">RESPONSE TIME:</span> {tier.response}
                  </p>
                  <p>
                    <span className="font-semibold">AVAILABILITY:</span> {tier.availability}
                  </p>
                  <p>
                    <span className="font-semibold">EXTRAS:</span> {tier.extras}
                  </p>
                </div>
              </div>

              <button
                disabled={loading || isTierLoading}
                onClick={() => handleSelectTier(tier.id)}
                className={`mt-6 sm:mt-8 py-3 px-6 rounded-lg text-xl font-semibold flex items-center justify-center gap-2 transition ${selectedTier === tier.id
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100 text-blue-900 hover:bg-blue-200"
                  }`}
              >
                {selectedTier === tier.id ? (
                  <>
                    <Check size={20} className="text-white" /> Selected
                  </>
                ) : loading ? (
                  "Please wait..."
                ) : (
                  "Select Tier"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-8 sm:mt-12">
          <button
            onClick={goBack}
            className="w-full sm:w-auto px-10 py-3 bg-white border border-gray-400 rounded-md text-xl text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>

          <button
            onClick={() => jumpToStep?.(3)}
            disabled={!isNextEnabled}
            className={`w-full sm:w-auto px-10 py-3 rounded-md text-xl font-semibold ${!isNextEnabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#032352] text-white hover:bg-blue-700"
              }`}
          >
            {status === "pending"
              ? "Upgrade Pending..."
              : status === "rejected"
                ? "Request Rejected"
                : "Next →"}
          </button>

        </div>
      </motion.div>
    </div>
  );
};

export default Step2;
