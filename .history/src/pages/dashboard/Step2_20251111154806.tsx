import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { Mail, MessageCircle, Phone, MessageSquare, Check } from "lucide-react";
import type { JSX } from "react";
import type { StepProps } from "../dashboard/types";
import axios from "axios";
import { toast } from "react-toastify";

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

  // -------------------------------
  // Helper: Normalize and resolve tier id
  // -------------------------------
  const resolveTierId = (value?: string | null): string | null => {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();

    // Try match by ID
    const byId = tiers.find((t) => t.id.toLowerCase() === normalized);
    if (byId) return byId.id;

    // Try match by title
    const byTitle = tiers.find((t) => t.title.toLowerCase() === normalized);
    if (byTitle) return byTitle.id;

    // Partial match (id or title contains input)
    const contains = tiers.find(
      (t) =>
        normalized.includes(t.id.toLowerCase()) ||
        t.title.toLowerCase().includes(normalized)
    );
    return contains?.id || null;
  };

  // -------------------------------
  // Helper: Convert storage string to GB
  // -------------------------------
  const parseStorageToGB = (storage: string | undefined | null): number => {
    if (!storage) return 0;
    const match = storage.match(/([\d.]+)\s*(GB|TB)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    return match[2].toUpperCase() === "TB" ? value * 1024 : value;
  };

  // -------------------------------
  // Fetch user and current tier info
  // -------------------------------
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  let currentTierIdResolved = resolveTierId(currentTier);
  let currentTierInfo =
    tiers.find((t) => t.id === currentTierIdResolved) || null;

  // If CUSTOM, fetch backend data for storage
  if (tierId === "custom") {
    try {
      const res = await axios.get(
        `${BASE_URL}/upgrade/request/by-email/${user.email || user.companyEmail}`
      );
      const backendData = res.data.data || {};
      const storage = backendData.tierStorage || user.tierStorage || "Custom Storage";

      currentTierInfo = {
        id: "custom",
        title: "CUSTOM",
        storage,
        rank: 999,
        channels: [],
        response: "",
        availability: "",
        extras: "",
      };
    } catch (err) {
      console.warn("❌ Could not fetch backend custom tier data:", err);
      currentTierInfo = {
        id: "custom",
        title: "CUSTOM",
        storage: user.tierStorage || "Custom Storage",
        rank: 999,
        channels: [],
        response: "",
        availability: "",
        extras: "",
      };
    }
  }

  console.log("Current Tier Info:", currentTierInfo);

  // -------------------------------
  // Handle CUSTOM Tier Flow
  // -------------------------------
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

    if (!customInput) return;

    const currentStorageGB = parseStorageToGB(currentTierInfo?.storage);
    const customStorageGB =
      customInput.unit === "TB" ? customInput.amount * 1024 : customInput.amount;

    if (customStorageGB < currentStorageGB) {
      await Swal.fire({
        icon: "warning",
        title: "Downgrade Not Allowed",
        text: `Your current storage is ${currentStorageGB} GB. Downgrades are not permitted.`,
        confirmButtonColor: "#032352",
      });
      return;
    }

    const confirmUpgrade = await Swal.fire({
      title: "Confirm Upgrade",
      html: `You are currently on <b>${currentTierInfo?.title || "CUSTOM"}</b> (${currentTierInfo?.storage}) and about to upgrade to <b>CUSTOM</b> (${customInput.amount} ${customInput.unit}).<br><br>Do you want to continue?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Upgrade",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#032352",
      cancelButtonColor: "#d33",
    });

    if (!confirmUpgrade.isConfirmed) return;

    try {
      setLoading(true);
      const payload = {
        userId: user._id || user.id || null,
        fullName: user.fullName || user.name,
        email: user.companyEmail || user.email,
        previousTier: currentTierInfo?.title || "CUSTOM",
        newTier: "CUSTOM",
        previousStorage: currentTierInfo?.storage || "0GB",
        newStorage: `${customInput.amount} ${customInput.unit}`,
        note: customInput.note || "",
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      console.log("🚀 Sending CUSTOM upgrade payload:", payload);
      const res = await axios.post(`${BASE_URL}/upgrade/request`, payload);

      toast.success(res.data.message || "Upgrade successful!");
      await Swal.fire({
        icon: "success",
        title: "Upgrade Request Submitted",
        text: `Your custom tier upgrade to ${customInput.amount} ${customInput.unit} has been submitted successfully.`,
        confirmButtonColor: "#032352",
      });

      setSelectedTier("custom");
      setFormData((prev) => ({
        ...prev,
        selectedTier: "custom",
        tierDetails: {
          title: "CUSTOM",
          storage: `${customInput.amount} ${customInput.unit}`,
          extras: customInput.note,
        },
      }));
      setIsNextEnabled(true);
      window.location.reload();
    } catch (err: any) {
      console.error("❌ Custom upgrade request failed:", err);
      Swal.fire({
        icon: "error",
        title: "Upgrade Request Failed",
        text:
          err.response?.data?.message ||
          "An error occurred while submitting your custom upgrade request.",
        confirmButtonColor: "#032352",
      });
    } finally {
      setLoading(false);
      console.log("⏹️ Finished custom tier process");
    }

    return;
  }

  // -------------------------------
  // Normal Tier Flow
  // -------------------------------
  const selectedTierInfo = tiers.find((t) => t.id === tierId);
  if (!selectedTierInfo) {
    console.warn("❌ No tier found for ID:", tierId);
    return;
  }

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
    setIsNextEnabled(true);

    await Swal.fire({
      icon: "success",
      title: "Tier Selected",
      text: `You’ve selected the ${selectedTierInfo.title}.`,
      confirmButtonColor: "#032352",
    });
    return;
  }

  const currentStorageGB = parseStorageToGB(currentTierInfo?.storage);
  const selectedStorageGB = parseStorageToGB(selectedTierInfo.storage);

  if (selectedStorageGB === currentStorageGB) {
    await Swal.fire({
      icon: "info",
      title: "Same Tier Selected",
      text: `You are already on ${currentTierInfo.title}.`,
      confirmButtonColor: "#032352",
    });
    return;
  }

  if (selectedStorageGB < currentStorageGB) {
    await Swal.fire({
      icon: "warning",
      title: "Downgrade Not Allowed",
      text: `Your current storage is ${currentStorageGB} GB. Downgrades are not permitted.`,
      confirmButtonColor: "#032352",
    });
    return;
  }

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

  if (!confirmUpgrade.isConfirmed) return;

  try {
    setLoading(true);
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

    console.log("🚀 Sending normal upgrade payload:", payload);
    const res = await axios.post(`${BASE_URL}/upgrade/request`, payload);

    toast.success(res.data.message || "Upgrade successful!");
    await Swal.fire({
      icon: "success",
      title: "Upgrade Request Submitted",
      text: `Your upgrade to ${selectedTierInfo.title} has been submitted successfully.`,
      confirmButtonColor: "#032352",
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
    console.error("❌ Normal upgrade request failed:", err);
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
    console.log("⏹️ Finished normal upgrade process");
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
