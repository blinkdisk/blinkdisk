import { useCallback } from "react";

export function useCalendar() {
  const addToCalendar = useCallback(
    (event: {
      title: string;
      description: string;
      start: Date;
      end: Date;
      type: "google" | "outlook" | "other";
    }) => {
      let calendarUrl = "";

      const start =
        event.start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const end =
        event.end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      switch (event.type) {
        case "google":
          calendarUrl = "https://calendar.google.com/calendar/render";
          calendarUrl += "?action=TEMPLATE";
          calendarUrl += "&dates=" + start;
          calendarUrl += "/" + end;
          calendarUrl += "&text=" + encodeURIComponent(event.title);
          calendarUrl += "&details=" + encodeURIComponent(event.description);
          break;

        case "outlook":
          calendarUrl = "https://outlook.live.com/owa/?rru=addevent";
          calendarUrl += "&startdt=" + start;
          calendarUrl += "&enddt=" + end;
          calendarUrl += "&subject=" + encodeURIComponent(event.title);
          calendarUrl += "&body=" + encodeURIComponent(event.description);
          calendarUrl += "&allday=false";
          calendarUrl +=
            "&uid=" + Math.floor(Math.random() * 999999999999).toString();
          calendarUrl += "&path=/calendar/view/Month";
          break;

        default:
          calendarUrl = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            "URL:" + document.URL,
            "DTSTART:" + start,
            "DTEND:" + end,
            "SUMMARY:" + event.title,
            "DESCRIPTION:" + event.description,
            "END:VEVENT",
            "END:VCALENDAR",
          ].join("\n");

          calendarUrl = encodeURI(
            "data:text/calendar;charset=utf8," + calendarUrl,
          );
      }

      window.open(calendarUrl, "_blank");
    },
    [],
  );

  return { addToCalendar };
}
