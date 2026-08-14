'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ExternalLink, Store } from 'lucide-react';
import { subscriptionsEndpoints } from '@/lib/api/endpoints/subscriptions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import type { SubscriptionDetail } from '@/lib/types/subscription';

interface SubscriptionDetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function SubscriptionDetailPage({ params }: SubscriptionDetailPageProps) {
  const t = useTranslations('subscriptions');
  const locale = useLocale();
  
  // Unwrap params Promise (Next.js 15)
  const resolvedParams = React.use(params);
  const subscriptionId = parseInt(resolvedParams.id, 10);

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['platform-subscription', subscriptionId],
    queryFn: () => subscriptionsEndpoints.getSubscription(subscriptionId),
  });

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
      case 'grace_period':
        return 'warning';
      case 'canceled':
      case 'expired':
        return 'destructive';
      case 'paused':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Format currency
  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return format(new Date(date), 'PPP');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">{t('loadingSubscription')}</div>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="space-y-6">
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">{t('subscriptionNotFound')}</div>
          <Button asChild className="mt-4" variant="outline">
            <Link href={`/${locale}/billing/subscriptions`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToSubscriptions')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link href={`/${locale}/billing/subscriptions`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToSubscriptions')}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{t('subscriptionDetails')}</h1>
          <p className="text-muted-foreground">
            {subscription.merchant.owner_name} • {subscription.plan.name}
          </p>
        </div>
        <Badge variant={getStatusVariant(subscription.status)} className="text-base px-3 py-1">
          {t(subscription.status)}
        </Badge>
      </div>

      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('overview')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t('plan')}</div>
              <div className="font-medium">{subscription.plan.name}</div>
              {subscription.pending_plan && (
                <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  {t('changingTo')} {subscription.pending_plan.name}{' '}
                  {subscription.pending_plan_effective_at && (
                    <>
                      {t('on')} {formatDate(subscription.pending_plan_effective_at)}
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t('price')}</div>
              <div className="font-medium">
                {subscription.plan_price ? (
                  <>
                    {formatCurrency(
                      subscription.plan_price.amount_cents,
                      subscription.plan_price.currency
                    )}{' '}
                    {t(subscription.billing_cycle === 'monthly' ? 'perMonth' : 'perYear')}
                  </>
                ) : (
                  '—'
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t('billingCycle')}</div>
              <div className="font-medium">{t(subscription.billing_cycle)}</div>
            </div>

            {subscription.trial_ends_at && (
              <div>
                <div className="text-sm text-muted-foreground">{t('trialEndsAt')}</div>
                <div className="font-medium">{formatDate(subscription.trial_ends_at)}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground">{t('currentPeriodStartsAt')}</div>
              <div className="font-medium">
                {formatDate(subscription.current_period_starts_at)}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t('currentPeriodEnds')}</div>
              <div className="font-medium">
                {formatDate(subscription.current_period_ends_at)}
              </div>
              {subscription.cancel_at_period_end && (
                <Badge variant="warning" className="mt-1">
                  {t('cancelAtPeriodEnd')}
                </Badge>
              )}
            </div>

            {subscription.grace_period_ends_at && (
              <div>
                <div className="text-sm text-muted-foreground">{t('gracePeriodEndsAt')}</div>
                <div className="font-medium">
                  {formatDate(subscription.grace_period_ends_at)}
                </div>
              </div>
            )}

            {subscription.canceled_at && (
              <div>
                <div className="text-sm text-muted-foreground">{t('canceledAt')}</div>
                <div className="font-medium">{formatDate(subscription.canceled_at)}</div>
              </div>
            )}

            {subscription.ended_at && (
              <div>
                <div className="text-sm text-muted-foreground">{t('endedAt')}</div>
                <div className="font-medium">{formatDate(subscription.ended_at)}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground">{t('createdAt')}</div>
              <div className="font-medium">{formatDate(subscription.created_at)}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t('provider')}</div>
              <div className="font-medium">{subscription.provider}</div>
            </div>

            {subscription.provider_subscription_id && (
              <div>
                <div className="text-sm text-muted-foreground">
                  {t('providerSubscriptionId')}
                </div>
                <div className="font-medium text-xs break-all">
                  {subscription.provider_subscription_id}
                </div>
              </div>
            )}

            {subscription.provider_status && (
              <div>
                <div className="text-sm text-muted-foreground">{t('providerStatus')}</div>
                <div className="font-medium">{subscription.provider_status}</div>
                {subscription.provider_synced_at && (
                  <div className="text-xs text-muted-foreground">
                    {t('lastSynced')}{' '}
                    {formatDistanceToNow(new Date(subscription.provider_synced_at), {
                      addSuffix: true,
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Merchant Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('merchantInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t('ownerName')}</div>
              <div className="font-medium">{subscription.merchant.owner_name}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t('ownerEmail')}</div>
              <div className="font-medium">{subscription.merchant.owner_email}</div>
            </div>

            {subscription.merchant.legal_name && (
              <div>
                <div className="text-sm text-muted-foreground">{t('legalName')}</div>
                <div className="font-medium">{subscription.merchant.legal_name}</div>
              </div>
            )}

            {subscription.merchant.billing_email && (
              <div>
                <div className="text-sm text-muted-foreground">{t('billingEmail')}</div>
                <div className="font-medium">{subscription.merchant.billing_email}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground">{t('billingAccountId')}</div>
              <div className="font-medium">{subscription.merchant.billing_account_id}</div>
            </div>
          </div>

          {/* Linked Stores */}
          {subscription.merchant.stores && subscription.merchant.stores.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">{t('linkedStores')}</div>
              <div className="space-y-2">
                {subscription.merchant.stores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/${locale}/stores/${store.id}`}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{store.name}</div>
                      <div className="text-xs text-muted-foreground">{store.slug}</div>
                    </div>
                    <Badge variant={getStatusVariant(store.status)}>
                      {t(`storeStatus.${store.status}`)}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('invoices')}</CardTitle>
          <CardDescription>
            Recent invoices (up to 20, newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.invoices && subscription.invoices.length > 0 ? (
            <div className="space-y-2">
              {subscription.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('issuedAt')}: {formatDate(invoice.issued_at)}
                      {invoice.paid_at && (
                        <> • {t('paidAt')}: {formatDate(invoice.paid_at)}</>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(invoice.total_cents, invoice.currency)}
                    </div>
                    {invoice.amount_paid_cents > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {t('amountPaid')}:{' '}
                        {formatCurrency(invoice.amount_paid_cents, invoice.currency)}
                      </div>
                    )}
                    {invoice.amount_due_cents > 0 && (
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        {t('amountDue')}:{' '}
                        {formatCurrency(invoice.amount_due_cents, invoice.currency)}
                      </div>
                    )}
                  </div>
                  {invoice.hosted_invoice_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t('noInvoices')}</div>
          )}
        </CardContent>
      </Card>

      {/* Status History / Events Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t('statusHistory')}</CardTitle>
          <CardDescription>
            Status change audit trail (up to 50 events, newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.events && subscription.events.length > 0 ? (
            <div className="space-y-4">
              {subscription.events.map((event, index) => (
                <div key={event.id} className="relative">
                  {index < subscription.events.length - 1 && (
                    <div className="absolute top-6 left-2 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex gap-3">
                    <div className="relative z-10 mt-1">
                      <div className="h-4 w-4 rounded-full border-2 border-primary bg-background" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{event.event_type}</div>
                          {(event.from_status || event.to_status) && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.from_status && (
                                <Badge variant="secondary" className="mr-1">
                                  {event.from_status}
                                </Badge>
                              )}
                              {event.from_status && event.to_status && '→'}
                              {event.to_status && (
                                <Badge
                                  variant={getStatusVariant(event.to_status)}
                                  className="ml-1"
                                >
                                  {event.to_status}
                                </Badge>
                              )}
                            </div>
                          )}
                          {event.reason && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {t('reason')}: {event.reason}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {t('source')}: {event.source}
                            {event.actor && <> • {t('actor')}: {event.actor}</>}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(event.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t('noEvents')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
