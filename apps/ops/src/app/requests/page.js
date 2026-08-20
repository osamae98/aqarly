import QueueFilters from "@/components/QueueFilters";
import RequestTable from "@/components/RequestTable";
import { getProperties, getRequests } from "@aqarly/core/operations";

export const metadata = {
  title: "Request queue",
};

export default async function RequestQueuePage({ searchParams }) {
  const params = await searchParams;

  const [requests, properties] = await Promise.all([
    getRequests({
      stage: params.stage,
      type: params.type,
      propertyId: params.propertyId,
      sla: params.sla,
      sort: params.sort,
    }),
    getProperties(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Request queue
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {requests.length} {requests.length === 1 ? "request" : "requests"}
        </p>
      </div>

      <QueueFilters searchParams={params} properties={properties} />
      <RequestTable requests={requests} />
    </div>
  );
}
