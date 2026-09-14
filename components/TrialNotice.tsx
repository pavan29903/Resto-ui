"use client";

import type { Subscription } from "@/lib/types";

/** Replace with the number you actually answer — same one as the landing page. */
const WHATSAPP = "918466901383";

function ask(message: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/** Tells an owner where they stand, and only when it matters.
 *
 *  Silent for the first three weeks of a trial. A banner shown every single
 *  visit is furniture by day three, and then invisible on the day it counts.
 *
 *  The wording never threatens the menu, because the menu is never switched
 *  off — an expired owner loses the ability to make changes, and that is all.
 *  Saying otherwise would frighten people into thinking their restaurant had
 *  gone offline.
 */
export default function TrialNotice({ sub }: { sub: Subscription | null }) {
  if (!sub || !sub.warn) return null;

  const days = sub.days_left;

  if (sub.status === "trialing") {
    return (
      <div className="notice">
        <p className="notice__body">
          <strong>
            {days <= 0
              ? "Your free month ends today."
              : days === 1
                ? "Your free month ends tomorrow."
                : `Your free month ends in ${days} days.`}
          </strong>{" "}
          Carry on for ₹1,999 for six months, or ₹2,999 for the year.
        </p>
        <a
          className="btn btn--primary btn--sm"
          href={ask("Hi — I'd like to carry on with RestoFood after my free month.")}
          target="_blank"
          rel="noreferrer"
        >
          Set up payment
        </a>
      </div>
    );
  }

  if (sub.status === "grace") {
    return (
      <div className="notice notice--warn">
        <p className="notice__body">
          <strong>Your plan has run out.</strong> Your menu is still live and
          your table codes still work. You can keep editing for{" "}
          {Math.max(0, 7 + days)} more days.
        </p>
        <a
          className="btn btn--primary btn--sm"
          href={ask("Hi — I'd like to renew my RestoFood plan.")}
          target="_blank"
          rel="noreferrer"
        >
          Renew
        </a>
      </div>
    );
  }

  return (
    <div className="notice notice--stop">
      <p className="notice__body">
        <strong>Menu editing is paused.</strong> Your menu is still live and
        your customers can still scan the codes on your tables — you just
        can&apos;t make changes until you renew.
      </p>
      <a
        className="btn btn--primary btn--sm"
        href={ask("Hi — I'd like to renew my RestoFood plan and start editing again.")}
        target="_blank"
        rel="noreferrer"
      >
        Renew
      </a>
    </div>
  );
}
