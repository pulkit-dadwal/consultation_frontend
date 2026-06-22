import { useEffect, useState } from "react";
import { fetchOnlineConsultants } from "../api/consultantApi";
import AppLayout from "../components/layout/AppLayout";
import ConsultantCard, {
  ConsultantFilters,
  useConsultantFilters,
} from "../components/consultants/ConsultantCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingScreen from "../components/common/LoadingScreen";

function LandingPage() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    search,
    setSearch,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    filteredConsultants,
  } = useConsultantFilters(consultants);

  useEffect(() => {
    const loadConsultants = async () => {
      try {
        const data = await fetchOnlineConsultants();
        setConsultants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadConsultants();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="space-y-2">
          <p className="text-sm font-medium text-indigo-600">Find your expert</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Browse online consultants
          </h1>
          <p className="max-w-2xl text-slate-600">
            Explore specialists, compare ratings and prices, and book a consultation
            when you are ready.
          </p>
        </section>

        <ConsultantFilters
          search={search}
          minRating={minRating}
          sortBy={sortBy}
          onSearchChange={setSearch}
          onMinRatingChange={setMinRating}
          onSortChange={setSortBy}
        />

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : filteredConsultants.length === 0 ? (
          <EmptyState
            title="No consultants found"
            description={
              consultants.length === 0
                ? "No consultants are online right now. Check back soon."
                : "Try adjusting your search or filters."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConsultants.map((consultant) => (
              <ConsultantCard key={consultant.id} consultant={consultant} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default LandingPage;