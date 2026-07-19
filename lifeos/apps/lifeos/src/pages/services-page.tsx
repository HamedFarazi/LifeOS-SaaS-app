import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SortAsc, Plus } from "lucide-react";
import { useServices } from "../store/use-services";
import { PageHeader } from "../components/page-header";
import { ServiceRow } from "../components/service-row";
import { CategoryIcon } from "../components/category-icon";
import { CATEGORY_META, CATEGORY_ORDER } from "../data/categories";
import { monthlyCost, daysUntil } from "../lib/dates";
import type { ServiceCategory } from "../types/index";
import styles from "./services-page.module.css";

type SortKey = "renewal" | "cost-high" | "cost-low" | "alpha";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "renewal", label: "تمدید" },
  { value: "cost-high", label: "🔺هزینه" },
  { value: "cost-low", label: "🔻 هزینه" },
  { value: "alpha", label: "الفبایی" },
];

export function ServicesPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ServiceCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("renewal");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? services
        : services.filter((s) => s.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case "renewal":
          return daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal);
        case "cost-high":
          return monthlyCost(b) - monthlyCost(a);
        case "cost-low":
          return monthlyCost(a) - monthlyCost(b);
        case "alpha":
          return a.name.localeCompare(b.name, "fa");
        default:
          return 0;
      }
    });
  }, [services, filter, query, sort]);

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === sort)?.label ?? "";

  return (
    <div>
      <PageHeader
        title="سرویس‌ها"
        subtitle={`${services.length} سرویس مدیریت‌شده`}
      />

      {/* Search + sort */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} strokeWidth={1.8} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="جستجو در سرویس‌ها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.sortWrap}>
          <button
            type="button"
            className={styles.sortBtn}
            onClick={() => setSortOpen((v) => !v)}
          >
            <SortAsc size={15} strokeWidth={1.8} />
            <span className={styles.sortLabel}>{currentSortLabel}</span>
          </button>
          {sortOpen && (
            <div className={styles.sortDropdown}>
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`${styles.sortOption} ${sort === o.value ? styles.sortOptionActive : ""}`}
                  onClick={() => {
                    setSort(o.value);
                    setSortOpen(false);
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => navigate("/add")}
        >
          <Plus size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Category chips */}
      <div className={styles.chips}>
        <button
          type="button"
          className={`${styles.chip} ${filter === "all" ? styles.activeChip : ""}`}
          onClick={() => setFilter("all")}
        >
          همه
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.chip} ${filter === cat ? styles.activeChip : ""}`}
            onClick={() => setFilter(cat)}
          >
            <CategoryIcon
              icon={CATEGORY_META[cat].icon}
              size={13}
              color={filter === cat ? "#0B1020" : CATEGORY_META[cat].color}
            />
            {CATEGORY_META[cat].labelFa}
          </button>
        ))}
      </div>

      {/* List */}
      <div className={styles.list}>
        {filtered.map((s) => (
          <ServiceRow
            key={s.id}
            service={s}
            onClick={() => navigate(`/service/${s.id}`)}
          />
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <Search size={32} strokeWidth={1.5} />
            <p>سرویسی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
