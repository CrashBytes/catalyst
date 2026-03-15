import { Card, CardBody } from "~/components/ui/Card";
import { Badge, type BadgeVariant } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";

export interface SubscriptionStatusProps {
  planName: string;
  billingPeriod: "monthly" | "annual";
  nextBillingDate?: string;
  cancelAtPeriodEnd?: boolean;
  stripePortalUrl?: string;
}

export function SubscriptionStatus({
  planName,
  billingPeriod,
  nextBillingDate,
  cancelAtPeriodEnd = false,
  stripePortalUrl,
}: SubscriptionStatusProps) {
  const statusVariant: BadgeVariant = cancelAtPeriodEnd ? "warning" : "success";
  const statusLabel = cancelAtPeriodEnd ? "Canceling" : "Active";

  return (
    <Card className="glass rail-left">
      <CardBody>
        <h3 className="text-base font-semibold text-white">
          Subscription Details
        </h3>

        <dl className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-guard-400">Plan</dt>
            <dd className="text-sm font-medium text-guard-300">{planName}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-sm text-guard-400">Status</dt>
            <dd>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-sm text-guard-400">Billing Period</dt>
            <dd className="text-sm font-medium capitalize text-guard-300">
              {billingPeriod}
            </dd>
          </div>

          {nextBillingDate && (
            <div className="flex items-center justify-between">
              <dt className="text-sm text-guard-400">
                {cancelAtPeriodEnd ? "Access Until" : "Next Billing Date"}
              </dt>
              <dd className="text-sm font-medium text-guard-300">
                {new Date(nextBillingDate).toLocaleDateString()}
              </dd>
            </div>
          )}
        </dl>

        {cancelAtPeriodEnd && (
          <div className="mt-4 rounded-lg bg-knowledge-900/30 border border-knowledge-700/30 p-3">
            <p className="text-sm text-knowledge-400">
              Your subscription will be canceled at the end of the current
              billing period. You will retain access until then.
            </p>
          </div>
        )}

        {stripePortalUrl && (
          <div className="mt-6">
            <a href={stripePortalUrl} target="_blank" rel="noopener noreferrer" className="text-catalyst-400 hover:text-catalyst-300 transition-colors">
              <Button variant="outline" className="w-full">
                Manage Subscription in Stripe
              </Button>
            </a>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
