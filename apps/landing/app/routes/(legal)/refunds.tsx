import Legal from "@landing/components/legal";
import { head } from "@landing/utils/head";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(legal)/refunds")({
  component: RouteComponent,
  head: head({
    title: "Refund Policy",
    description: "The refund policy for BlinkDisk.",
  }),
});

function RouteComponent() {
  return (
    <Legal>{`# Refund Policy

Last updated: September 23, 2025

## 1. Cancellation Policy

Subscribers may cancel their recurring subscription at any time. Upon cancellation, your subscription will remain active until the end of your current billing cycle.

## 2. Refund Eligibility

To be eligible for a refund, you must submit a request within 14 days of your subscription start date. Refunds may be considered on a case-by-case basis and are granted at the sole discretion of BlinkDisk.

Please note that refunds are not guaranteed and may vary depending on the circumstances. We will refuse a refund request if we find evidence of fraud, refund abuse, or other manipulative behaviour that entitles BlinkDisk to counterclaim the refund.

## 3. Process for Requesting a Refund

To request a refund, please contact our customer support team at refunds@blinkdisk.com. Include your account information, subscription details, and a brief explanation of why you are requesting a refund.

## 4. Refund Processing

Once your refund request is received and inspected, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within a certain number of days. Please note that refunds can only be made back to the original payment method used at the time of purchase.

## 5. Changes to Refund Policy

BlinkDisk reserves the right to modify this refund policy at any time. Changes will take effect immediately upon their posting on the website. By continuing to use our services after changes are made, you agree to be bound by the revised policy.

## 6. Contact Us

If you have any questions about our refund policy, please contact us at support@blinkdisk.com.`}</Legal>
  );
}
