import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import TextInput from "@/components/form/TextInput";
import Select from "@/components/form/Select";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import Notification from "@/components/ui/Notification";
import API from "@/services/index";

const initialForm = {
  // 1) Household Information
  name: "",
  contact_number: "",
  family_members: 0,
  vulnerable_elderly: false,
  vulnerable_children_u5: false,
  vulnerable_pregnant_lactating: false,

  // 2) Housing & Living Conditions
  house_structurally_damaged: false,
  furniture_lost: false,
  living_status: "", // "OWN" | "RELATIVE" | "SHELTER"
  need_repairs: false,
  need_bedding: false,
  need_cooking_items: false,
  need_water: false,
  need_sanitation: false,

  // 3) Livelihood & Income
  previous_job_business: "",
  tools_equipment_lost: false,
  unable_to_work_currently: false,
  restart_tools: false,
  restart_materials: false,
  restart_capital: false,
  restart_training: false,

  // 4) Food & Essential Supplies
  enough_daily_food: "", // "YES" | "NO"
  clean_drinking_water_available: false,
  need_dry_rations: false,
  need_hygiene_items: false,
  need_medicine: false,
  need_clothing: false,

  // 5) Children & Schooling
  children_attending_school_before_flood: false,
  lost_books_uniforms_supplies: false,
  issues_returning_to_school: "",
  school_transport_affected: false,

  // 6) Health & Well-Being
  illnesses_after_flood: "",
  on_regular_medication: false,
  emotional_stress_adults: false,
  emotional_stress_children: false,

  // 7) Support Received
  support_government: false,
  support_ngo_charity: false,
  support_community_relatives: false,
  support_none: false,

  // 8) Priority Needs
  priority_1: "",
  priority_2: "",
  priority_3: "",
  notes: "",
};

const SectionCard = ({ title, icon, children }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
        {icon ? <Icon icon={icon} width={18} className="text-gray-700 dark:text-gray-200" /> : null}
        <h2 className="font-dm-sans text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const CheckItem = ({ checked, onChange, label }) => (
  <label className="flex items-start gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700"
    />
    <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>
  </label>
);

const RadioPill = ({ name, value, checked, onChange, label }) => (
  <label
    className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer select-none text-sm
      ${
        checked
          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
      }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="h-4 w-4"
    />
    {label}
  </label>
);

const CollectPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review modal (optional but helpful)
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Keep support checkboxes logically consistent:
  // - If support_none is checked => uncheck others
  // - If any others are checked => uncheck support_none
  const setSupport = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "support_none" && value === true) {
        next.support_government = false;
        next.support_ngo_charity = false;
        next.support_community_relatives = false;
      }

      if (
        (key === "support_government" || key === "support_ngo_charity" || key === "support_community_relatives") &&
        value === true
      ) {
        next.support_none = false;
      }

      return next;
    });
  };

  // Living status is stored as 3 booleans in DB; we store a single UI value and map on submit
  const livingOptions = [
    { value: "OWN", label: "Own home" },
    { value: "RELATIVE", label: "Relative’s home" },
    { value: "SHELTER", label: "Temporary shelter" },
  ];

  const yesNoOptions = [
    { value: "YES", label: "Yes" },
    { value: "NO", label: "No" },
  ];

  // Completion checklist + summary chips
  const checklist = useMemo(() => {
    const hasName = form.name.trim().length > 0;
    const hasContact = form.contact_number.trim().length > 0;
    const hasLiving = !!form.living_status;
    const hasFood = form.enough_daily_food === "YES" || form.enough_daily_food === "NO";
    const hasPriority =
      form.priority_1.trim().length > 0 || form.priority_2.trim().length > 0 || form.priority_3.trim().length > 0;

    return {
      hasName,
      hasContact,
      hasLiving,
      hasFood,
      hasPriority,
      completeCount: [hasName, hasContact, hasLiving, hasFood, hasPriority].filter(Boolean).length,
      totalCount: 5,
    };
  }, [form]);

  const chips = useMemo(() => {
    const out = [];
    if (form.house_structurally_damaged) out.push("Structural damage");
    if (form.furniture_lost) out.push("Furniture lost");
    if (form.need_water) out.push("Needs water");
    if (form.need_sanitation) out.push("Needs sanitation");
    if (form.need_medicine) out.push("Needs medicine");
    if (form.need_dry_rations) out.push("Needs dry rations");
    if (form.support_none) out.push("No support yet");
    if (form.unable_to_work_currently) out.push("Unable to work");
    if (form.vulnerable_children_u5) out.push("Children <5");
    if (form.vulnerable_elderly) out.push("Elderly");
    if (form.vulnerable_pregnant_lactating) out.push("Pregnant/Lactating");
    if (form.living_status === "SHELTER") out.push("In temporary shelter");
    if (form.enough_daily_food === "NO") out.push("Not enough food");
    return out.slice(0, 10);
  }, [form]);

  const buildPayloadForBackend = () => {
    // Convert UI-only fields to the 3 DB booleans
    const living_own_home = form.living_status === "OWN";
    const living_relatives_home = form.living_status === "RELATIVE";
    const living_temporary_shelter = form.living_status === "SHELTER";

    return {
      // 1
      name: form.name.trim(),
      contact_number: form.contact_number.trim(),
      family_members: Number(form.family_members || 0),

      vulnerable_elderly: !!form.vulnerable_elderly,
      vulnerable_children_u5: !!form.vulnerable_children_u5,
      vulnerable_pregnant_lactating: !!form.vulnerable_pregnant_lactating,

      // 2
      house_structurally_damaged: !!form.house_structurally_damaged,
      furniture_lost: !!form.furniture_lost,

      living_own_home,
      living_relatives_home,
      living_temporary_shelter,

      need_repairs: !!form.need_repairs,
      need_bedding: !!form.need_bedding,
      need_cooking_items: !!form.need_cooking_items,
      need_water: !!form.need_water,
      need_sanitation: !!form.need_sanitation,

      // 3
      previous_job_business: form.previous_job_business?.trim() || null,
      tools_equipment_lost: !!form.tools_equipment_lost,
      unable_to_work_currently: !!form.unable_to_work_currently,

      restart_tools: !!form.restart_tools,
      restart_materials: !!form.restart_materials,
      restart_capital: !!form.restart_capital,
      restart_training: !!form.restart_training,

      // 4
      enough_daily_food: form.enough_daily_food || null,
      clean_drinking_water_available: !!form.clean_drinking_water_available,

      need_dry_rations: !!form.need_dry_rations,
      need_hygiene_items: !!form.need_hygiene_items,
      need_medicine: !!form.need_medicine,
      need_clothing: !!form.need_clothing,

      // 5
      children_attending_school_before_flood: !!form.children_attending_school_before_flood,
      lost_books_uniforms_supplies: !!form.lost_books_uniforms_supplies,
      issues_returning_to_school: form.issues_returning_to_school?.trim() || null,
      school_transport_affected: !!form.school_transport_affected,

      // 6
      illnesses_after_flood: form.illnesses_after_flood?.trim() || null,
      on_regular_medication: !!form.on_regular_medication,
      emotional_stress_adults: !!form.emotional_stress_adults,
      emotional_stress_children: !!form.emotional_stress_children,

      // 7
      support_government: !!form.support_government,
      support_ngo_charity: !!form.support_ngo_charity,
      support_community_relatives: !!form.support_community_relatives,
      support_none: !!form.support_none,

      // 8
      priority_1: form.priority_1?.trim() || null,
      priority_2: form.priority_2?.trim() || null,
      priority_3: form.priority_3?.trim() || null,

      notes: form.notes?.trim() || null,
    };
  };

  const hardCheckBeforeSubmit = () => {
    // You said frontend validation exists; we’ll keep this as a very light guard to prevent empty saves by accident.
    // If you truly want zero checks, you can remove this and always submit.
    if (!form.name.trim()) return "Name is required.";
    if (!form.contact_number.trim()) return "Contact number is required.";
    if (!form.living_status) return "Please select where the household is currently living.";
    if (!form.enough_daily_food) return "Please select whether there is enough daily food.";
    return null;
  };

  const submit = async () => {
    const err = hardCheckBeforeSubmit();
    if (err) return Notification.error(err);

    setIsSubmitting(true);
    try {
      const payload = buildPayloadForBackend();
      const res = await API.private.createAssessment(payload);

      if (res?.data?.code === "OK") {
        Notification.success("Saved successfully.");
        setForm(initialForm);
        setIsReviewOpen(false);
      } else {
        Notification.error(res?.data?.message || "Failed to save. Please try again.");
      }
    } catch (e) {
      console.error(e);
      Notification.error("Failed to save. Please check the backend and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    Notification.success("Form cleared.");
  };

  return (
    <DefaultLayout>
      <div className="font-dm-sans">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Household Assessment Form</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Flood-Relief Needs Collection • Today</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/today")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Icon icon="mdi:chart-box" width={18} />
                View Today Dashboard
              </button>

              <button
                onClick={() => setIsReviewOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white transition"
              >
                <Icon icon="mdi:check-circle-outline" width={18} />
                Review & Submit
              </button>
            </div>
          </div>

          {/* Layout grid */}
          <div className="mt-6 grid grid-cols-12 gap-5">
            {/* Left: Form */}
            <div className="col-span-12 lg:col-span-8 space-y-5">
              {/* 1 */}
              <SectionCard title="1. Household Information" icon="mdi:account">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Name"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                  <TextInput
                    label="Contact Number"
                    placeholder="07X XXXXXXX"
                    value={form.contact_number}
                    onChange={(e) => setField("contact_number", e.target.value)}
                  />
                  <TextInput
                    label="Number of family members"
                    type="number"
                    value={form.family_members}
                    onChange={(e) => setField("family_members", Number(e.target.value || 0))}
                  />

                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Vulnerable members</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CheckItem
                        checked={form.vulnerable_elderly}
                        onChange={(v) => setField("vulnerable_elderly", v)}
                        label="Elderly"
                      />
                      <CheckItem
                        checked={form.vulnerable_children_u5}
                        onChange={(v) => setField("vulnerable_children_u5", v)}
                        label="Children < 5"
                      />
                      <CheckItem
                        checked={form.vulnerable_pregnant_lactating}
                        onChange={(v) => setField("vulnerable_pregnant_lactating", v)}
                        label="Pregnant / Lactating"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 2 */}
              <SectionCard title="2. Housing & Living Conditions" icon="mdi:home-city">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CheckItem
                      checked={form.house_structurally_damaged}
                      onChange={(v) => setField("house_structurally_damaged", v)}
                      label="House structurally damaged"
                    />
                    <CheckItem
                      checked={form.furniture_lost}
                      onChange={(v) => setField("furniture_lost", v)}
                      label="Furniture lost"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Currently living in</p>
                    <div className="flex flex-wrap gap-2">
                      {livingOptions.map((opt) => (
                        <RadioPill
                          key={opt.value}
                          name="living_status"
                          value={opt.value}
                          checked={form.living_status === opt.value}
                          onChange={(val) => setField("living_status", val)}
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Immediate needs</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CheckItem
                        checked={form.need_repairs}
                        onChange={(v) => setField("need_repairs", v)}
                        label="Repairs"
                      />
                      <CheckItem
                        checked={form.need_bedding}
                        onChange={(v) => setField("need_bedding", v)}
                        label="Bedding"
                      />
                      <CheckItem
                        checked={form.need_cooking_items}
                        onChange={(v) => setField("need_cooking_items", v)}
                        label="Cooking items"
                      />
                      <CheckItem checked={form.need_water} onChange={(v) => setField("need_water", v)} label="Water" />
                      <CheckItem
                        checked={form.need_sanitation}
                        onChange={(v) => setField("need_sanitation", v)}
                        label="Sanitation"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 3 */}
              <SectionCard title="3. Livelihood & Income" icon="mdi:briefcase">
                <div className="space-y-4">
                  <TextInput
                    label="Previous job / business"
                    placeholder="e.g., Daily wage worker, shop owner..."
                    value={form.previous_job_business}
                    onChange={(e) => setField("previous_job_business", e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CheckItem
                      checked={form.tools_equipment_lost}
                      onChange={(v) => setField("tools_equipment_lost", v)}
                      label="Tools/equipment lost"
                    />
                    <CheckItem
                      checked={form.unable_to_work_currently}
                      onChange={(v) => setField("unable_to_work_currently", v)}
                      label="Unable to work currently"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Needs to restart livelihood
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CheckItem
                        checked={form.restart_tools}
                        onChange={(v) => setField("restart_tools", v)}
                        label="Tools"
                      />
                      <CheckItem
                        checked={form.restart_materials}
                        onChange={(v) => setField("restart_materials", v)}
                        label="Materials"
                      />
                      <CheckItem
                        checked={form.restart_capital}
                        onChange={(v) => setField("restart_capital", v)}
                        label="Capital"
                      />
                      <CheckItem
                        checked={form.restart_training}
                        onChange={(v) => setField("restart_training", v)}
                        label="Training"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 4 */}
              <SectionCard title="4. Food & Essential Supplies" icon="mdi:food">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Enough daily food?"
                      value={form.enough_daily_food}
                      onChange={(v) => setField("enough_daily_food", v)}
                      options={yesNoOptions}
                      placeholder="Select"
                    />
                    <div className="pt-7">
                      <CheckItem
                        checked={form.clean_drinking_water_available}
                        onChange={(v) => setField("clean_drinking_water_available", v)}
                        label="Clean drinking water available"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Needs</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CheckItem
                        checked={form.need_dry_rations}
                        onChange={(v) => setField("need_dry_rations", v)}
                        label="Dry rations"
                      />
                      <CheckItem
                        checked={form.need_hygiene_items}
                        onChange={(v) => setField("need_hygiene_items", v)}
                        label="Hygiene items"
                      />
                      <CheckItem
                        checked={form.need_medicine}
                        onChange={(v) => setField("need_medicine", v)}
                        label="Medicine"
                      />
                      <CheckItem
                        checked={form.need_clothing}
                        onChange={(v) => setField("need_clothing", v)}
                        label="Clothing"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 5 */}
              <SectionCard title="5. Children & Schooling" icon="mdi:school">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CheckItem
                      checked={form.children_attending_school_before_flood}
                      onChange={(v) => setField("children_attending_school_before_flood", v)}
                      label="Children attending school before flood"
                    />
                    <CheckItem
                      checked={form.lost_books_uniforms_supplies}
                      onChange={(v) => setField("lost_books_uniforms_supplies", v)}
                      label="Lost books/uniforms/school supplies"
                    />
                    <CheckItem
                      checked={form.school_transport_affected}
                      onChange={(v) => setField("school_transport_affected", v)}
                      label="School transport affected"
                    />
                  </div>

                  <TextInput
                    label="Issues returning to school"
                    placeholder="Write a short note (optional)"
                    value={form.issues_returning_to_school}
                    onChange={(e) => setField("issues_returning_to_school", e.target.value)}
                  />
                </div>
              </SectionCard>

              {/* 6 */}
              <SectionCard title="6. Health & Well-Being" icon="mdi:heart-pulse">
                <div className="space-y-4">
                  <TextInput
                    label="Any illnesses after flood?"
                    placeholder="e.g., fever, cough, skin issues..."
                    value={form.illnesses_after_flood}
                    onChange={(e) => setField("illnesses_after_flood", e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CheckItem
                      checked={form.on_regular_medication}
                      onChange={(v) => setField("on_regular_medication", v)}
                      label="On regular medication"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Emotional stress observed in
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CheckItem
                        checked={form.emotional_stress_adults}
                        onChange={(v) => setField("emotional_stress_adults", v)}
                        label="Adults"
                      />
                      <CheckItem
                        checked={form.emotional_stress_children}
                        onChange={(v) => setField("emotional_stress_children", v)}
                        label="Children"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 7 */}
              <SectionCard title="7. Support Received So Far" icon="mdi:hand-heart">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <CheckItem
                    checked={form.support_government}
                    onChange={(v) => setSupport("support_government", v)}
                    label="Government assistance"
                  />
                  <CheckItem
                    checked={form.support_ngo_charity}
                    onChange={(v) => setSupport("support_ngo_charity", v)}
                    label="NGO/charity support"
                  />
                  <CheckItem
                    checked={form.support_community_relatives}
                    onChange={(v) => setSupport("support_community_relatives", v)}
                    label="Community/relatives support"
                  />
                  <CheckItem
                    checked={form.support_none}
                    onChange={(v) => setSupport("support_none", v)}
                    label="No support received yet"
                  />
                </div>
              </SectionCard>

              {/* 8 */}
              <SectionCard title="8. Priority Needs (Top 3)" icon="mdi:alert-circle">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextInput
                    label="Priority 1"
                    placeholder="Most urgent need"
                    value={form.priority_1}
                    onChange={(e) => setField("priority_1", e.target.value)}
                  />
                  <TextInput
                    label="Priority 2"
                    placeholder="Second urgent need"
                    value={form.priority_2}
                    onChange={(e) => setField("priority_2", e.target.value)}
                  />
                  <TextInput
                    label="Priority 3"
                    placeholder="Third urgent need"
                    value={form.priority_3}
                    onChange={(e) => setField("priority_3", e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <TextInput
                    label="Extra notes (optional)"
                    placeholder="Any additional notes"
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </div>
              </SectionCard>

              {/* Bottom actions (mobile-friendly) */}
              <div className="flex flex-wrap gap-2 lg:hidden">
                <button
                  onClick={() => setIsReviewOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white transition"
                >
                  <Icon icon="mdi:check-circle-outline" width={18} />
                  Review & Submit
                </button>

                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Icon icon="mdi:restore" width={18} />
                  Reset
                </button>
              </div>
            </div>

            {/* Right: Sticky panel */}
            <div className="hidden lg:block col-span-4">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Review</h3>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {checklist.completeCount}/{checklist.totalCount}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Name</span>
                      {checklist.hasName ? (
                        <Icon icon="mdi:check-circle" width={18} className="text-emerald-700" />
                      ) : (
                        <Icon icon="mdi:alert-circle" width={18} className="text-amber-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Contact</span>
                      {checklist.hasContact ? (
                        <Icon icon="mdi:check-circle" width={18} className="text-emerald-700" />
                      ) : (
                        <Icon icon="mdi:alert-circle" width={18} className="text-amber-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Living status</span>
                      {checklist.hasLiving ? (
                        <Icon icon="mdi:check-circle" width={18} className="text-emerald-700" />
                      ) : (
                        <Icon icon="mdi:alert-circle" width={18} className="text-amber-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Food security</span>
                      {checklist.hasFood ? (
                        <Icon icon="mdi:check-circle" width={18} className="text-emerald-700" />
                      ) : (
                        <Icon icon="mdi:alert-circle" width={18} className="text-amber-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Priorities</span>
                      {checklist.hasPriority ? (
                        <Icon icon="mdi:check-circle" width={18} className="text-emerald-700" />
                      ) : (
                        <Icon icon="mdi:alert-circle" width={18} className="text-amber-600" />
                      )}
                    </div>
                  </div>

                  {chips.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Quick summary</p>
                      <div className="flex flex-wrap gap-2">
                        {chips.map((c) => (
                          <span
                            key={c}
                            className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      onClick={() => setIsReviewOpen(true)}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white transition ${
                        isSubmitting
                          ? "bg-emerald-600 opacity-70 cursor-not-allowed"
                          : "bg-emerald-700 hover:bg-emerald-800"
                      }`}
                      disabled={isSubmitting}
                    >
                      <Icon icon="mdi:content-save" width={18} />
                      {isSubmitting ? "Saving..." : "Review & Submit"}
                    </button>

                    <button
                      onClick={resetForm}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <Icon icon="mdi:restore" width={18} />
                      Reset form
                    </button>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => navigate("/today")}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <Icon icon="mdi:chart-box" width={18} />
                      View Today Dashboard
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  Tip: Keep entries short and consistent (e.g., “Water”, “Bedding”, “Medicine”) for clean stats.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title="Review & Submit"
          size="lg"
          centered={true}
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Back
              </button>
              <button
                onClick={submit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white transition ${
                  isSubmitting ? "bg-emerald-600 opacity-70 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Household</p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-200">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Name:</span> {form.name || "-"}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Contact:</span> {form.contact_number || "-"}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Family members:</span> {form.family_members}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Living:</span>{" "}
                  {livingOptions.find((x) => x.value === form.living_status)?.label || "-"}
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick Summary</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Top Priorities</p>
              <ul className="mt-2 text-sm text-gray-700 dark:text-gray-200 list-disc pl-5 space-y-1">
                <li>{form.priority_1 || "-"}</li>
                <li>{form.priority_2 || "-"}</li>
                <li>{form.priority_3 || "-"}</li>
              </ul>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Submitting will save this household assessment into today’s dataset.
            </div>
          </div>
        </Modal>
      </div>
    </DefaultLayout>
  );
};

export default CollectPage;
