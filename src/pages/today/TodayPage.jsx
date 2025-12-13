import React, { useEffect, useMemo, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";

const pastelCardStyles = [
  {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-900/40",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconText: "text-emerald-800 dark:text-emerald-200",
    valueText: "text-emerald-950 dark:text-emerald-100",
    labelText: "text-emerald-800/80 dark:text-emerald-200/80",
  },
  {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-900/40",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconText: "text-sky-800 dark:text-sky-200",
    valueText: "text-sky-950 dark:text-sky-100",
    labelText: "text-sky-800/80 dark:text-sky-200/80",
  },
  {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-900/40",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconText: "text-violet-800 dark:text-violet-200",
    valueText: "text-violet-950 dark:text-violet-100",
    labelText: "text-violet-800/80 dark:text-violet-200/80",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-900/40",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconText: "text-rose-800 dark:text-rose-200",
    valueText: "text-rose-950 dark:text-rose-100",
    labelText: "text-rose-800/80 dark:text-rose-200/80",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/40",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconText: "text-amber-800 dark:text-amber-200",
    valueText: "text-amber-950 dark:text-amber-100",
    labelText: "text-amber-800/80 dark:text-amber-200/80",
  },
  {
    bg: "bg-teal-50 dark:bg-teal-950/30",
    border: "border-teal-200 dark:border-teal-900/40",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconText: "text-teal-800 dark:text-teal-200",
    valueText: "text-teal-950 dark:text-teal-100",
    labelText: "text-teal-800/80 dark:text-teal-200/80",
  },
];

const StatCard = ({ label, value, icon, styleIndex = 0 }) => {
  const s = pastelCardStyles[styleIndex % pastelCardStyles.length];

  return (
    <div className={`${s.bg} ${s.border} border rounded-xl shadow-sm p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs ${s.labelText}`}>{label}</p>
          <p className={`mt-1 text-2xl font-semibold ${s.valueText}`}>{value ?? 0}</p>
        </div>

        {icon ? (
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.iconBg} border ${s.border}`}>
            <Icon icon={icon} width={20} className={s.iconText} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const BarRow = ({ label, value, maxValue, tone = "emerald" }) => {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

  const track = "bg-gray-200/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-800";
  const fill =
    tone === "sky"
      ? "bg-sky-500/80"
      : tone === "violet"
      ? "bg-violet-500/80"
      : tone === "rose"
      ? "bg-rose-500/80"
      : tone === "amber"
      ? "bg-amber-500/80"
      : tone === "teal"
      ? "bg-teal-500/80"
      : "bg-emerald-600/80";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
        <span>{label}</span>
        <span className="text-gray-600 dark:text-gray-300">{value}</span>
      </div>

      <div className={`h-2.5 rounded-full overflow-hidden ${track}`}>
        <div className={`h-2.5 ${fill}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon, children, right, tint = "bg-white dark:bg-gray-900" }) => {
  return (
    <div className={`${tint} border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm`}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? <Icon icon={icon} width={18} className="text-gray-700 dark:text-gray-200" /> : null}
          <h2 className="font-dm-sans text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
        {right || null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const TodayPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, rowsRes] = await Promise.all([
        API.private.getTodayAssessmentStats(),
        API.private.getTodayAssessments(),
      ]);

      if (statsRes?.data?.code === "OK") setStats(statsRes.data);
      else Notification.error(statsRes?.data?.message || "Failed to load stats.");

      if (rowsRes?.data?.code === "OK") setRows(rowsRes.data.data || []);
      else Notification.error(rowsRes?.data?.message || "Failed to load today's entries.");
    } catch (e) {
      console.error(e);
      Notification.error("Failed to load dashboard. Check backend/API base URL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = stats?.cards || {};
  const needsBreakdown = stats?.charts?.needs_breakdown || {};
  const topPriorities = stats?.charts?.top_priorities || [];

  const needsList = useMemo(() => {
    return [
      { key: "repairs", label: "Repairs", value: Number(needsBreakdown.repairs || 0), tone: "emerald" },
      { key: "bedding", label: "Bedding", value: Number(needsBreakdown.bedding || 0), tone: "sky" },
      { key: "cooking", label: "Cooking items", value: Number(needsBreakdown.cooking || 0), tone: "violet" },
      { key: "water", label: "Water", value: Number(needsBreakdown.water || 0), tone: "teal" },
      { key: "sanitation", label: "Sanitation", value: Number(needsBreakdown.sanitation || 0), tone: "amber" },
    ];
  }, [needsBreakdown]);

  const maxNeed = useMemo(() => Math.max(...needsList.map((x) => x.value), 0), [needsList]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const name = String(r.name || "").toLowerCase();
      const contact = String(r.contact_number || "").toLowerCase();
      const priority1 = String(r.priority_1 || "").toLowerCase();
      const priority2 = String(r.priority_2 || "").toLowerCase();
      const priority3 = String(r.priority_3 || "").toLowerCase();

      return (
        name.includes(q) ||
        contact.includes(q) ||
        priority1.includes(q) ||
        priority2.includes(q) ||
        priority3.includes(q)
      );
    });
  }, [rows, search]);

  const statCards = useMemo(() => {
    return [
      { label: "Total households", value: cards.total_households ?? 0, icon: "mdi:account-group" },
      { label: "Structural damage", value: cards.structural_damage ?? 0, icon: "mdi:home-alert" },
      { label: "Temporary shelter", value: cards.temporary_shelter ?? 0, icon: "mdi:home-city" },
      { label: "Not enough food", value: cards.not_enough_food ?? 0, icon: "mdi:food-off" },
      { label: "No support yet", value: cards.no_support_yet ?? 0, icon: "mdi:hand-heart" },
      { label: "Elderly present", value: cards.elderly_present ?? 0, icon: "mdi:account-heart" },
      { label: "Children <5", value: cards.children_under_5 ?? 0, icon: "mdi:baby-face-outline" },
      { label: "Pregnant/Lactating", value: cards.pregnant_lactating ?? 0, icon: "mdi:human-pregnant" },
      { label: "Water needed", value: cards.water_needed ?? 0, icon: "mdi:water" },
      { label: "Sanitation needed", value: cards.sanitation_needed ?? 0, icon: "mdi:toilet" },
      { label: "Medicine needed", value: cards.medicine_needed ?? 0, icon: "mdi:medical-bag" },
      { label: "Unable to work", value: cards.unable_to_work ?? 0, icon: "mdi:briefcase-remove" },
    ];
  }, [cards]);

  // Small pastel header strip
  const headerTint =
    "bg-gradient-to-r from-emerald-50 via-sky-50 to-violet-50 dark:from-emerald-950/20 dark:via-sky-950/20 dark:to-violet-950/20";

  return (
    <DefaultLayout>
      <div className="font-dm-sans">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className={`rounded-xl border border-gray-200 dark:border-gray-800 p-5 ${headerTint}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  13th December 2025 Flood Relief Dashboard
                </h1>
                <p className="text-sm text-gray-700/80 dark:text-gray-200/80">
                  Live overview + entries collected today
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchAll}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 transition ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  <Icon icon="mdi:refresh" width={18} />
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((c, idx) => (
              <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} styleIndex={idx} />
            ))}
          </div>

          {/* Charts */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard
              title="Immediate Needs Breakdown"
              icon="mdi:chart-bar"
              tint="bg-emerald-50/50 dark:bg-emerald-950/20"
            >
              <div className="space-y-3">
                {needsList.map((n) => (
                  <BarRow key={n.key} label={n.label} value={n.value} maxValue={maxNeed} tone={n.tone} />
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600/80 dark:text-gray-300/80">
                Shows how many households selected each immediate need.
              </div>
            </SectionCard>

            <SectionCard title="Top Priorities (Top 5)" icon="mdi:star" tint="bg-sky-50/50 dark:bg-sky-950/20">
              {topPriorities.length === 0 ? (
                <p className="text-sm text-gray-700/80 dark:text-gray-300/80">No priorities recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {topPriorities.map((p, i) => (
                    <div
                      key={`${p.priority}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 px-3 py-2"
                    >
                      <span className="text-sm text-gray-800 dark:text-gray-200">{p.priority}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 text-xs text-gray-600/80 dark:text-gray-300/80">
                Tip: keep priority words consistent (e.g., “Water”, “Food”, “Medicine”) for cleaner charts.
              </div>
            </SectionCard>
          </div>

          {/* Table */}
          <div className="mt-5">
            <SectionCard
              title="Today Entries"
              icon="mdi:table"
              tint="bg-violet-50/40 dark:bg-violet-950/20"
              right={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name / phone / priority..."
                      className="w-65 bg-white/80 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <Icon icon="mdi:magnify" width={18} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-700/80 dark:text-gray-300/80">
                    {filteredRows.length} / {rows.length}
                  </div>
                </div>
              }
            >
              {loading ? (
                <p className="text-sm text-gray-700/80 dark:text-gray-300/80">Loading...</p>
              ) : filteredRows.length === 0 ? (
                <p className="text-sm text-gray-700/80 dark:text-gray-300/80">No entries found for today.</p>
              ) : (
                <div className="overflow-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white/70 dark:bg-gray-900/60">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white/60 dark:bg-gray-900/50">
                      <tr className="text-left text-gray-700 dark:text-gray-200">
                        <th className="px-4 py-3 whitespace-nowrap">Time</th>
                        <th className="px-4 py-3 whitespace-nowrap">Name</th>
                        <th className="px-4 py-3 whitespace-nowrap">Contact</th>
                        <th className="px-4 py-3 whitespace-nowrap">Living</th>
                        <th className="px-4 py-3 whitespace-nowrap">Top Priority</th>
                        <th className="px-4 py-3 whitespace-nowrap">Flags</th>
                        <th className="px-4 py-3 whitespace-nowrap"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r) => {
                        const living = r.living_temporary_shelter
                          ? "Shelter"
                          : r.living_relatives_home
                          ? "Relative"
                          : "Own";

                        const flags = [];
                        if (r.house_structurally_damaged) flags.push({ text: "Damage", tone: "rose" });
                        if (r.enough_daily_food === "NO") flags.push({ text: "No food", tone: "amber" });
                        if (r.need_water) flags.push({ text: "Water", tone: "teal" });
                        if (r.need_sanitation) flags.push({ text: "Sanitation", tone: "violet" });
                        if (r.need_medicine) flags.push({ text: "Medicine", tone: "sky" });
                        if (r.support_none) flags.push({ text: "No support", tone: "emerald" });

                        const chipTone = (tone) => {
                          if (tone === "rose")
                            return "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-100";
                          if (tone === "amber")
                            return "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-100";
                          if (tone === "teal")
                            return "bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/30 dark:border-teal-900/40 dark:text-teal-100";
                          if (tone === "violet")
                            return "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/30 dark:border-violet-900/40 dark:text-violet-100";
                          if (tone === "sky")
                            return "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-900/40 dark:text-sky-100";
                          return "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-100";
                        };

                        return (
                          <tr
                            key={r.id}
                            className="border-t border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700/80 dark:text-gray-200/80">
                              {fmtDateTime(r.collected_at)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                              {r.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-200">
                              {r.contact_number}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{living}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{r.priority_1 || "-"}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {flags.length === 0 ? (
                                  <span className="text-xs text-gray-600/70 dark:text-gray-300/70">—</span>
                                ) : (
                                  flags.slice(0, 5).map((f) => (
                                    <span
                                      key={f.text}
                                      className={`text-xs px-2 py-1 rounded-full border ${chipTone(f.tone)}`}
                                    >
                                      {f.text}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button
                                onClick={() => setSelectedRow(r)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 transition text-sm"
                              >
                                <Icon icon="mdi:eye" width={18} />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        {/* View Modal */}
        <Modal
          isOpen={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          title="Household Assessment Details"
          size="xl"
          centered={true}
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 transition"
              >
                Close
              </button>
            </div>
          }
        >
          {!selectedRow ? null : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Name</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedRow.name}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-sky-50/60 dark:bg-sky-950/20 p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Contact</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedRow.contact_number}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-violet-50/60 dark:bg-violet-950/20 p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Family members</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedRow.family_members}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-amber-50/60 dark:bg-amber-950/20 p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Collected at</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {fmtDateTime(selectedRow.collected_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Priorities</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
                  <li>{selectedRow.priority_1 || "-"}</li>
                  <li>{selectedRow.priority_2 || "-"}</li>
                  <li>{selectedRow.priority_3 || "-"}</li>
                </ul>
              </div>

              {selectedRow.notes ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-rose-50/40 dark:bg-rose-950/20 p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</p>
                  <p className="text-gray-800 dark:text-gray-200">{selectedRow.notes}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Key Indicators</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-800 dark:text-gray-200">
                  <div>Structural damage: {selectedRow.house_structurally_damaged ? "Yes" : "No"}</div>
                  <div>Furniture lost: {selectedRow.furniture_lost ? "Yes" : "No"}</div>
                  <div>Enough daily food: {selectedRow.enough_daily_food || "-"}</div>
                  <div>Clean drinking water: {selectedRow.clean_drinking_water_available ? "Yes" : "No"}</div>
                  <div>No support yet: {selectedRow.support_none ? "Yes" : "No"}</div>
                  <div>Unable to work: {selectedRow.unable_to_work_currently ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DefaultLayout>
  );
};

export default TodayPage;
