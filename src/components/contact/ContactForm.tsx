"use client";

import { useId, useState } from "react";
import { t } from "@/lib/copy";

/**
 * ⚠ Front-end only, exactly like AuthForm: no request, no mail, no storage.
 * `onSubmit` stops at a visible notice rather than faking a success state,
 * because a contact form that appears to send and silently drops the message is
 * worse than no form at all — the sender walks away believing they were heard.
 *
 * When the API lands, replace the body of `onSubmit` and delete the notice.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  const nameId = useId();
  const contactId = useId();
  const topicId = useId();
  const messageId = useId();
  const noticeId = useId();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={nameId} className="eyebrow">
            {t.contact.fieldName}
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-2 h-12 w-full border border-line bg-ground px-3.5 text-base text-ink transition-colors placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor={contactId} className="eyebrow">
            {t.contact.fieldContact}
          </label>
          {/* One field for either, rather than forcing a choice between phone
              and email — the sender knows which they check. */}
          <input
            id={contactId}
            name="contact"
            type="text"
            inputMode="email"
            autoComplete="email"
            required
            className="mt-2 h-12 w-full border border-line bg-ground px-3.5 text-base text-ink transition-colors placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={topicId} className="eyebrow">
          {t.contact.fieldTopic}
        </label>
        <select
          id={topicId}
          name="topic"
          defaultValue={t.contact.topics[0]}
          className="mt-2 h-12 w-full border border-line bg-ground px-3 text-base text-ink transition-colors focus:border-accent focus:outline-none"
        >
          {t.contact.topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor={messageId} className="eyebrow">
          {t.contact.fieldMessage}
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={5}
          required
          className="mt-2 w-full resize-y border border-line bg-ground p-3.5 text-base leading-relaxed text-ink transition-colors placeholder:text-faint focus:border-accent focus:outline-none"
        />
      </div>

      <button
        type="submit"
        aria-describedby={sent ? noticeId : undefined}
        className="mt-6 h-12 w-full touch-manipulation rounded-full bg-ink px-8 text-[0.75rem] font-bold tracking-[0.14em] text-ground uppercase transition-colors hover:bg-accent hover:text-accent-ink sm:w-auto"
      >
        {t.contact.send}
      </button>

      {sent && (
        <p
          id={noticeId}
          role="status"
          className="mt-4 border-l-2 border-flare pl-3 text-sm leading-relaxed text-muted"
        >
          {t.common.formDemoNotice}
        </p>
      )}
    </form>
  );
}
