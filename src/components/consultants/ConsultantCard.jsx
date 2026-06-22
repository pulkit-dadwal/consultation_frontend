import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search } from "lucide-react";
import Badge from "../ui/Badge";
import { formatCurrency } from "../../utils/formatters";

function ConsultantCard({ consultant }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/consultants/${consultant.id}`)}
      className="w-full rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-snug">
              {consultant.name || "Unknown Consultant"}
            </h3>
            <p className="text-xs font-medium text-indigo-600 mt-0.5">
              {consultant.specialization || "General Consultant"}
            </p>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">
              {formatCurrency(consultant.consultation_fee_per_minute)} / min
            </p>
          </div>
        </div>
        <Badge variant="online">Online</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm border-t border-slate-50 pt-3">
        <span className="text-slate-500">
          {Number(consultant.rating).toFixed(1)} ★ rating
        </span>
        <span className="font-medium text-indigo-600">View profile</span>
      </div>
    </button>
  );
}

export default ConsultantCard;

export function filterAndSortConsultants(consultants, { search, minRating, sortBy }) {
  let result = [...consultants];

  if (search.trim()) {
    const query = search.trim().toLowerCase();
    result = result.filter((consultant) => {
      const specMatch = (consultant.specialization || "General Consultant")
        .toLowerCase()
        .includes(query);
      const nameMatch = (consultant.name || "")
        .toLowerCase()
        .includes(query);
      return specMatch || nameMatch;
    });
  }

  if (minRating) {
    const threshold = Number(minRating);
    result = result.filter((consultant) => Number(consultant.rating) >= threshold);
  }

  if (sortBy === "price-asc") {
    result.sort(
      (a, b) =>
        Number(a.consultation_fee_per_minute ?? 0) -
        Number(b.consultation_fee_per_minute ?? 0)
    );
  } else if (sortBy === "price-desc") {
    result.sort(
      (a, b) =>
        Number(b.consultation_fee_per_minute ?? 0) -
        Number(a.consultation_fee_per_minute ?? 0)
    );
  } else if (sortBy === "rating-desc") {
    result.sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  return result;
}

export function ConsultantFilters({ search, minRating, sortBy, onSearchChange, onMinRatingChange, onSortChange }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
      <div>
        <label htmlFor="search" className="mb-2 block text-sm font-medium text-slate-700">
          Search
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or specialization..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="minRating" className="mb-2 block text-sm font-medium text-slate-700">
          Minimum rating
        </label>
        <select
          id="minRating"
          value={minRating}
          onChange={(event) => onMinRatingChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Any rating</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </div>

      <div>
        <label htmlFor="sortBy" className="mb-2 block text-sm font-medium text-slate-700">
          Sort by
        </label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="rating-desc">Highest rating</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
    </div>
  );
}

export function useConsultantFilters(consultants) {
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("rating-desc");

  const filteredConsultants = useMemo(
    () => filterAndSortConsultants(consultants, { search, minRating, sortBy }),
    [consultants, search, minRating, sortBy]
  );

  return {
    search,
    setSearch,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    filteredConsultants,
  };
}